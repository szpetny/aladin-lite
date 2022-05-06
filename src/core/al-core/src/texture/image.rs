use cgmath::{Vector2, Vector3};

pub trait ArrayBuffer: AsRef<js_sys::Object> + std::fmt::Debug {
    type Item: std::cmp::PartialOrd + Clone + Copy + std::fmt::Debug + cgmath::Zero;

    fn new(buf: &[Self::Item]) -> Self;
    fn empty(size: u32, blank_value: Self::Item) -> Self;

    fn to_vec(&self) -> Vec<Self::Item>;

    fn set_index(&self, idx: u32, value: Self::Item);
    fn get(&self, idx: u32) -> Self::Item;
}
#[derive(Debug)]
pub struct ArrayU8(js_sys::Uint8Array);
impl AsRef<js_sys::Object> for ArrayU8 {
    fn as_ref(&self) -> &js_sys::Object {
        self.0.as_ref()
    }
}

impl ArrayBuffer for ArrayU8 {
    type Item = u8;

    fn new(buf: &[Self::Item]) -> Self {
        ArrayU8(buf.into())
    }

    fn empty(size: u32, blank_value: Self::Item) -> Self {
        let uint8_arr = js_sys::Uint8Array::new_with_length(size).fill(blank_value, 0, size);
        let array = ArrayU8(uint8_arr);
        array
    }

    fn to_vec(&self) -> Vec<Self::Item> {
        self.0.to_vec()
    }

    fn set_index(&self, idx: u32, value: Self::Item) {
        self.0.set_index(idx, value);
    }

    fn get(&self, idx: u32) -> Self::Item {
        self.0.get_index(idx)
    }
}
#[derive(Debug)]
pub struct ArrayI16(js_sys::Int16Array);
impl AsRef<js_sys::Object> for ArrayI16 {
    fn as_ref(&self) -> &js_sys::Object {
        self.0.as_ref()
    }
}

impl ArrayBuffer for ArrayI16 {
    type Item = i16;
    fn new(buf: &[Self::Item]) -> Self {
        ArrayI16(buf.into())
    }

    fn empty(size: u32, blank_value: Self::Item) -> Self {
        let int16_arr = js_sys::Int16Array::new_with_length(size).fill(blank_value, 0, size);
        let array = ArrayI16(int16_arr);
        array
    }

    fn to_vec(&self) -> Vec<Self::Item> {
        self.0.to_vec()
    }

    fn set_index(&self, idx: u32, value: Self::Item) {
        self.0.set_index(idx, value);
    }

    fn get(&self, idx: u32) -> Self::Item {
        self.0.get_index(idx)
    }
}
#[derive(Debug)]
pub struct ArrayI32(js_sys::Int32Array);
impl AsRef<js_sys::Object> for ArrayI32 {
    fn as_ref(&self) -> &js_sys::Object {
        self.0.as_ref()
    }
}
impl ArrayBuffer for ArrayI32 {
    type Item = i32;

    fn new(buf: &[Self::Item]) -> Self {
        ArrayI32(buf.into())
    }

    fn empty(size: u32, blank_value: Self::Item) -> Self {
        let int32_arr = js_sys::Int32Array::new_with_length(size).fill(blank_value, 0, size);
        let array = ArrayI32(int32_arr);
        array
    }

    fn to_vec(&self) -> Vec<Self::Item> {
        self.0.to_vec()
    }

    fn set_index(&self, idx: u32, value: Self::Item) {
        self.0.set_index(idx, value);
    }

    fn get(&self, idx: u32) -> Self::Item {
        self.0.get_index(idx)
    }
}
#[derive(Debug)]
pub struct ArrayF32(js_sys::Float32Array);
impl AsRef<js_sys::Object> for ArrayF32 {
    fn as_ref(&self) -> &js_sys::Object {
        self.0.as_ref()
    }
}

impl ArrayBuffer for ArrayF32 {
    type Item = f32;

    fn new(buf: &[Self::Item]) -> Self {
        ArrayF32(buf.into())
    }
    fn empty(size: u32, blank_value: Self::Item) -> Self {
        let f32_arr = js_sys::Float32Array::new_with_length(size).fill(blank_value, 0, size);
        let array = ArrayF32(f32_arr);
        array
    }

    fn to_vec(&self) -> Vec<Self::Item> {
        self.0.to_vec()
    }

    fn set_index(&self, idx: u32, value: Self::Item) {
        self.0.set_index(idx, value);
    }

    fn get(&self, idx: u32) -> Self::Item {
        self.0.get_index(idx)
    }
}

#[derive(Debug)]
pub struct ArrayF64(js_sys::Float64Array);
impl AsRef<js_sys::Object> for ArrayF64 {
    fn as_ref(&self) -> &js_sys::Object {
        self.0.as_ref()
    }
}

impl ArrayBuffer for ArrayF64 {
    type Item = f64;

    fn new(buf: &[Self::Item]) -> Self {
        ArrayF64(buf.into())
    }
    fn empty(size: u32, blank_value: Self::Item) -> Self {
        let f64_arr = js_sys::Float64Array::new_with_length(size).fill(blank_value, 0, size);
        let array = ArrayF64(f64_arr);
        array
    }

    fn to_vec(&self) -> Vec<Self::Item> {
        self.0.to_vec()
    }

    fn set_index(&self, idx: u32, value: Self::Item) {
        self.0.set_index(idx, value);
    }

    fn get(&self, idx: u32) -> Self::Item {
        self.0.get_index(idx)
    }
}

use super::format::ImageFormat;
use super::pixel::Pixel;
#[derive(Debug)]
#[allow(dead_code)]
pub struct ImageBuffer<T>
where
    T: ImageFormat,
{
    data: Vec<<<T as ImageFormat>::P as Pixel>::Item>,
    size: Vector2<i32>,
}

impl<T> ImageBuffer<T>
where
    T: ImageFormat,
{
    pub fn new(data: Vec<<<T as ImageFormat>::P as Pixel>::Item>, width: i32, height: i32) -> Self {
        let size_buf = width * height * (T::NUM_CHANNELS as i32);
        debug_assert!(size_buf == data.len() as i32);
        //let buf = <<T as ImageFormat>::P as Pixel>::Container::new(buf);
        let size = Vector2::new(width, height);
        Self {
            data,
            size,
        }
    }

    pub fn empty() -> Self {
        let size = Vector2::new(0, 0);
        Self {
            data: vec![],
            size,
        }
    }

    pub fn allocate(
        pixel_fill: &<T as ImageFormat>::P,
        width: i32,
        height: i32,
    ) -> ImageBuffer<T> {
        let size_buf = ((width * height) as usize) * (T::NUM_CHANNELS);

        let mut data = pixel_fill
            .as_ref()
            .iter()
            .cloned()
            .cycle()
            .take(size_buf)
            .collect::<Vec<_>>();

        ImageBuffer::<T>::new(data, width, height)
    }

    pub fn tex_sub(&mut self, src: &Self, sx: i32, sy: i32, sw: i32, sh: i32, dx: i32, dy: i32, dw: i32, dh: i32) {
        let mut di = dx;
        let mut dj = dy;

        for ix in sx..(sx+sw) {
            for iy in sy..(sy+sh) {
                let s_idx = (iy * src.width() + ix) as usize;
                let d_idx = (di * self.width() + dj) as usize;

                for i in 0..T::NUM_CHANNELS {
                    let si = s_idx * T::NUM_CHANNELS + i;
                    let di = d_idx * T::NUM_CHANNELS + i;
                    let value = src.data[si];
                    self.data[di] = value;
                }

                di += 1;
                if di >= dx + dw {
                    di = dx;
                    dj += 1;
                }
            }
        }
    }

    pub fn iter(&self) -> impl Iterator<Item = &<<T as ImageFormat>::P as Pixel>::Item> {
        self.data.iter()
    }

    pub fn get_data(&self) -> &[<<T as ImageFormat>::P as Pixel>::Item] {
        &self.data
    }

    pub fn width(&self) -> i32 {
        self.size.x
    }

    pub fn height(&self) -> i32 {
        self.size.y
    }
}

use crate::texture::{RGB8U, RGBA8U, R32F, R8UI, R16I, R32I};
pub enum ImageBufferType {
    JPG(ImageBuffer<RGB8U>),
    PNG(ImageBuffer<RGBA8U>),
    R32F(ImageBuffer<R32F>),
    R8UI(ImageBuffer<R8UI>),
    R16I(ImageBuffer<R16I>),
    R32I(ImageBuffer<R32I>),
}

use super::Texture2DArray;
pub trait Image {
    fn tex_sub_image_3d(
        &self,
        // The texture array
        textures: &Texture2DArray,
        // An offset to write the image in the texture array
        offset: &Vector3<i32>,
    );

    // The size of the image
    //fn get_size(&self) -> &Vector2<i32>;
}

impl<'a, I> Image for &'a I
where
    I: Image
{
    fn tex_sub_image_3d(
        &self,
        // The texture array
        textures: &Texture2DArray,
        // An offset to write the image in the texture array
        offset: &Vector3<i32>,
    ) {
        let image = &**self;
        image.tex_sub_image_3d(textures, offset);
    }

    /*fn get_size(&self) -> &Vector2<i32> {
        let image = &**self;
        image.get_size()
    }*/
}

use std::rc::Rc;
impl<I> Image for Rc<I>
where
    I: Image,
{
    fn tex_sub_image_3d(
        &self,
        // The texture array
        textures: &Texture2DArray,
        // An offset to write the image in the texture array
        offset: &Vector3<i32>,
    ) {
        let image = &**self;
        image.tex_sub_image_3d(textures, offset);
    }

    /*fn get_size(&self) -> &Vector2<i32> {
        let image = &**self;
        image.get_size()
    }*/
}

use std::sync::{Arc, Mutex};
impl<I> Image for Arc<Mutex<Option<I>>>
where
    I: Image,
{
    fn tex_sub_image_3d(
        &self,
        // The texture array
        textures: &Texture2DArray,
        // An offset to write the image in the texture array
        offset: &Vector3<i32>,
    ) {
        if let Some(image) = &*self.lock().unwrap() {
            image.tex_sub_image_3d(textures, offset);
        }
    }

    /*fn get_size(&self) -> &Vector2<i32> {
        if let Some(image) = &*self.lock().unwrap() {
            image.get_size()
        } else {
            unreachable!();
        }
    }*/
}

impl<I> Image for ImageBuffer<I>
where
    I: ImageFormat,
{
    fn tex_sub_image_3d(
        &self,
        // The texture array
        textures: &Texture2DArray,
        // An offset to write the image in the texture array
        offset: &Vector3<i32>,
    ) {
        let js_array = <<<I as ImageFormat>::P as Pixel>::Container as ArrayBuffer>::new(&self.data);
        textures[offset.z as usize]
            .bind()
            .tex_sub_image_2d_with_i32_and_i32_and_u32_and_type_and_opt_array_buffer_view(
                offset.x,
                offset.y,
                self.size.x,
                self.size.y,
                Some(js_array.as_ref()),
            );
    }

    // The size of the image
    /*fn get_size(&self) -> &Vector2<i32> {
        &self.size
    }*/
}



