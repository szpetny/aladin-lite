
use al_core::image::format::ImageFormatType;

use crate::downloader::{query};
use al_core::image::{fits::Fits, ImageType};

use super::{Request, RequestType};
use crate::downloader::QueryId;
pub struct AllskyRequest {
    pub hips_url: Url,
    pub url: Url,
    pub depth_tile: u8,
    pub id: QueryId,

    request: Request<Vec<ImageType>>,
}

impl From<AllskyRequest> for RequestType {
    fn from(request: AllskyRequest) -> Self {
        RequestType::Allsky(request)
    }
}

use crate::survey::Url;
use wasm_bindgen_futures::JsFuture;
use web_sys::{RequestInit, RequestMode, Response};

use al_core::{image::raw::ImageBuffer, texture::pixel::Pixel};
use wasm_bindgen::JsCast;
use crate::downloader::query::Query;
use wasm_bindgen::JsValue;
use al_core::image::format::R64F;

async fn query_image(url: &str) -> Result<ImageBuffer<RGBA8U>, JsValue> {
    let image = web_sys::HtmlImageElement::new().unwrap_abort();
    let image_cloned = image.clone();

    let html_img_elt_promise = js_sys::Promise::new(
        &mut (Box::new(move |resolve, reject| {
            // let url = web_sys::Url::create_object_url_with_blob(&blob).unwrap_abort();
            image_cloned.set_cross_origin(Some(""));
            image_cloned.set_onload(
                Some(&resolve)
            );
            image_cloned.set_onerror(
                Some(&reject)
            );
            image_cloned.set_src(url);
        }) as Box<dyn FnMut(js_sys::Function, js_sys::Function)>)
    );

    let _ = JsFuture::from(html_img_elt_promise).await?;

    // The image has been received here
    let document = web_sys::window().unwrap_abort().document().unwrap_abort();
    let canvas = document
        .create_element("canvas")?
        .dyn_into::<web_sys::HtmlCanvasElement>()?;
    canvas.set_width(image.width());
    canvas.set_height(image.height());
    let context = canvas
        .get_context("2d")?
        .unwrap_abort()
        .dyn_into::<web_sys::CanvasRenderingContext2d>()?;
    context.draw_image_with_html_image_element(&image, 0.0, 0.0)?;
    let w = image.width();
    let h = image.height();
    let image_data = context.get_image_data(0.0, 0.0, w as f64, h as f64)?;
    let raw_bytes = image_data.data();

    Ok(ImageBuffer::from_raw_bytes(raw_bytes.0, w as i32, h as i32))
}

impl From<query::Allsky> for AllskyRequest {
    // Create a tile request associated to a HiPS
    fn from(query: query::Allsky) -> Self {
        let id = query.id();
        let query::Allsky {
            format,
            tile_size,
            url,
            hips_url,
            texture_size,
        } = query;

        let depth_tile = crate::math::utils::log_2_unchecked(texture_size / tile_size) as u8;

        let url_clone = url.clone();

        let request = Request::new(async move {
            match format {
                ImageFormatType::RGB8U => {
                    let allsky_tile_size = std::cmp::min(tile_size, 64);
                    let allsky = query_image(&url_clone).await?;

                    let allsky_tiles = handle_allsky_file::<RGBA8U>(allsky, allsky_tile_size, texture_size, tile_size)?
                        .into_iter()
                        .map(|image| {
                            let ImageBuffer { data, size } = image;
                            let data = data.into_iter().enumerate().filter(|&(i, _)| i % 4 != 3).map(|(_, v)| v).collect();
                            let image = ImageBuffer::new(data, size.x, size.y);

                            ImageType::RawRgb8u { image }
                        })
                        .collect();

                    Ok(allsky_tiles)
                }
                ImageFormatType::RGBA8U => {
                    let allsky_tile_size = std::cmp::min(tile_size, 64);
                    let allsky = query_image(&url_clone).await?;

                    let allsky_tiles = handle_allsky_file(allsky, allsky_tile_size, texture_size, tile_size)?
                        .into_iter()
                        .map(|image| ImageType::RawRgba8u { image })
                        .collect();

                    Ok(allsky_tiles)
                }
                _ => {
                    let mut opts = RequestInit::new();
                    opts.method("GET");
                    opts.mode(RequestMode::Cors);
                    let window = web_sys::window().unwrap_abort();
        
                    let request = web_sys::Request::new_with_str_and_init(&url_clone, &opts)?;
                    if let Ok(resp_value) = JsFuture::from(window.fetch_with_request(&request)).await {
                        let tile_size = tile_size as i32;
                        // `resp_value` is a `Response` object.
                        debug_assert!(resp_value.is_instance_of::<Response>());
                        let resp: Response = resp_value.dyn_into()?;
        
                        let buf = JsFuture::from(resp.array_buffer()?).await?;
        
                        let width_allsky_px = 27 * std::cmp::min(tile_size, 64) as i32;
                        let height_allsky_px = 29 * std::cmp::min(tile_size, 64) as i32;
        
                        let num_pixels = (width_allsky_px * height_allsky_px) as usize;
        
                        let allsky_tiles = match format {
                            ImageFormatType::R32F => {
                                let raw_bytes = js_sys::Uint8Array::new(&buf);
                                // Parsing the raw bytes coming from the received array buffer (Uint8Array)
                                let image = Fits::<R32F>::new(&raw_bytes)?;
                                let raw = unsafe {
                                    std::slice::from_raw_parts(
                                        image.aligned_data_raw_bytes_ptr,
                                        num_pixels,
                                    )
                                };
        
                                handle_allsky_fits(raw, tile_size, texture_size)?
                                    .into_iter()
                                    .map(|image| ImageType::RawR32f { image })
                                    .collect()
                            }
                            ImageFormatType::R64F => {
                                let raw_bytes = js_sys::Uint8Array::new(&buf);
                                // Parsing the raw bytes coming from the received array buffer (Uint8Array)
                                let image = Fits::<R64F>::new(&raw_bytes)?;
                                let raw: &[f64] = unsafe {
                                    std::slice::from_raw_parts(
                                        image.aligned_data_raw_bytes_ptr,
                                        num_pixels,
                                    )
                                };
        
                                let raw_f32 = raw.iter().map(|&v| v as f32).collect::<Vec<_>>();
        
                                handle_allsky_fits(&raw_f32, tile_size, texture_size)?
                                    .into_iter()
                                    .map(|image| ImageType::RawR32f { image })
                                    .collect()
                            }
                            ImageFormatType::R32I => {
                                let raw_bytes = js_sys::Uint8Array::new(&buf);
                                // Parsing the raw bytes coming from the received array buffer (Uint8Array)
                                let image = Fits::<R32I>::new(&raw_bytes)?;
                                let raw = unsafe {
                                    std::slice::from_raw_parts(
                                        image.aligned_data_raw_bytes_ptr,
                                        num_pixels,
                                    )
                                };
        
                                handle_allsky_fits(raw, tile_size, texture_size)?
                                    .into_iter()
                                    .map(|image| ImageType::RawR32i { image })
                                    .collect()
                            }
                            ImageFormatType::R16I => {
                                let raw_bytes = js_sys::Uint8Array::new(&buf);
                                // Parsing the raw bytes coming from the received array buffer (Uint8Array)
                                let image = Fits::<R16I>::new(&raw_bytes)?;
                                let raw = unsafe {
                                    std::slice::from_raw_parts(
                                        image.aligned_data_raw_bytes_ptr,
                                        num_pixels,
                                    )
                                };
        
                                handle_allsky_fits(raw, tile_size, texture_size)?
                                    .into_iter()
                                    .map(|image| ImageType::RawR16i { image })
                                    .collect()
                            }
                            ImageFormatType::R8UI => {
                                let raw_bytes = js_sys::Uint8Array::new(&buf);
                                // Parsing the raw bytes coming from the received array buffer (Uint8Array)
                                let image = Fits::<R8UI>::new(&raw_bytes)?;
                                let raw = unsafe {
                                    std::slice::from_raw_parts(
                                        image.aligned_data_raw_bytes_ptr,
                                        num_pixels,
                                    )
                                };
        
                                handle_allsky_fits(raw, tile_size, texture_size)?
                                    .into_iter()
                                    .map(|image| ImageType::RawR8ui { image })
                                    .collect()
                            }
                            _ => return Err(js_sys::Error::new("Format not supported").into()),
                        };
        
                        Ok(allsky_tiles)
                    } else {
                        Err(js_sys::Error::new("Allsky not fetched").into())
                    }
                }
            }
        });

        Self {
            id,
            hips_url,
            depth_tile,
            url,
            request,
        }
    }
}

use al_core::image::format::ImageFormat;
use al_core::image::raw::ImageBufferView;
fn handle_allsky_file<F: ImageFormat>(
    allsky: ImageBuffer<F>,
    allsky_tile_size: i32,
    texture_size: i32,
    tile_size: i32,
) -> Result<Vec<ImageBuffer<F>>, JsValue> {
    let num_tiles_per_texture = (texture_size / tile_size)*(texture_size / tile_size);
    let num_tiles = num_tiles_per_texture*12;
    let mut tiles = Vec::with_capacity(num_tiles as usize);

    let num_allsky_tiles_per_tile = (tile_size / allsky_tile_size)*(tile_size / allsky_tile_size);

    let mut src_idx = 0;
    for _ in 0..num_tiles {
        let mut base_tile = ImageBuffer::<F>::allocate(&<F as ImageFormat>::P::BLACK, tile_size, tile_size);
        for idx_tile in 0..num_allsky_tiles_per_tile {
            let (x, y) = crate::utils::unmortonize(idx_tile as u64);
            let dx = x * (allsky_tile_size as u32);
            let dy = y * (allsky_tile_size as u32);

            let sx = (src_idx % 27) * allsky_tile_size;
            let sy = (src_idx / 27) * allsky_tile_size;
            let s = ImageBufferView {
                x: sx as i32,
                y: sy as i32,
                w: allsky_tile_size as i32,
                h: allsky_tile_size as i32
            };
            let d = ImageBufferView {
                x: dx as i32,
                y: dy as i32,
                w: allsky_tile_size as i32,
                h: allsky_tile_size as i32
            };

            base_tile.tex_sub(&allsky, &s, &d);

            src_idx += 1;
        }

        tiles.push(base_tile);
    }

    Ok(tiles)
}

fn handle_allsky_fits<F: ImageFormat>(
    allsky_data: &[<<F as ImageFormat>::P as Pixel>::Item],
    tile_size: i32,
    texture_size: i32,
) -> Result<Vec<ImageBuffer<F>>, JsValue> {
    let allsky_tile_size = std::cmp::min(tile_size, 64);
    let width_allsky_px = 27 * allsky_tile_size;
    let height_allsky_px = 29 * allsky_tile_size;
    // The fits image layout stores rows in reverse
    let reversed_rows_data = allsky_data
        .chunks(width_allsky_px as usize)
        .rev()
        .flatten()
        .copied()
        .collect::<Vec<_>>();

    let allsky = ImageBuffer::<F>::new(reversed_rows_data, width_allsky_px, height_allsky_px);

    let allsky_tiles = handle_allsky_file::<F>(allsky, allsky_tile_size, texture_size, tile_size)?
        .into_iter()
        .map(|image| {
            // The GPU does a specific transformation on the UV
            // for FITS tiles
            // We must revert this to be compatible with this GPU transformation
            let mut new_image_data = Vec::with_capacity(tile_size as usize);
            for c in image.get_data().chunks((tile_size * tile_size) as usize) {
                new_image_data.extend(c.chunks(tile_size as usize).rev().flatten());
            }

            ImageBuffer::<F>::new(new_image_data, tile_size, tile_size)
        })
        .collect();

    Ok(allsky_tiles)
}

use al_core::image::format::{R16I, R32F, R32I, R8UI, RGBA8U};

use crate::time::Time;
use std::sync::{Arc, Mutex};
pub struct Allsky {
    pub image: Arc<Mutex<Option<Vec<ImageType>>>>,
    pub time_req: Time,
    pub depth_tile: u8,

    pub hips_url: Url,
    url: Url,
}

use crate::Abort;

impl Allsky {
    pub fn missing(&self) -> bool {
        self.image.lock().unwrap_abort().is_none()
    }

    pub fn get_hips_url(&self) -> &Url {
        &self.hips_url
    }

    pub fn get_url(&self) -> &Url {
        &self.url
    }
}

impl<'a> From<&'a AllskyRequest> for Option<Allsky> {
    fn from(request: &'a AllskyRequest) -> Self {
        let AllskyRequest {
            request,
            hips_url,
            depth_tile,
            url,
            ..
        } = request;
        if request.is_resolved() {
            let Request::<Vec<ImageType>> {
                time_request, data, ..
            } = request;
            Some(Allsky {
                time_req: *time_request,
                // This is a clone on a Arc, it is supposed to be fast
                image: data.clone(),
                hips_url: hips_url.clone(),
                url: url.clone(),
                depth_tile: *depth_tile,
            })
        } else {
            None
        }
    }
}
