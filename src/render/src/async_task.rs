// Async task executor
// This executor can be used to spawn some async task that
// can be run concurrently on one thread under a time limit period
// When the time limit is reached, the executor stops polling the remaining
// futures and return the results of the finished ones
use task_async_executor::Executor;
pub type TaskExecutor = Executor<TaskType, TaskResult>;

pub use crate::buffer::Tile;
pub use crate::renderable::catalog::Source;
pub use crate::shaders::Colormap;
pub enum TaskResult {
    TableParsed {
        name: String,
        sources: Vec<Source>,
        colormap: Colormap,
    },
    TileSentToGPU {
        tile: Tile,
    },
}

#[derive(Hash, Eq, PartialEq, Clone)]
pub enum TaskType {
    SendTileToGPU(Tile),
    ParseTable,
}

use futures::stream::Stream;

use wasm_bindgen::JsValue;

// Task that parse a table
pub struct ParseTable<T>
where
    T: DeserializeOwned + AsRef<[f32]>,
{
    table: js_sys::Array,
    idx: u32,
    next_val_ready: Option<T>,
}

use wasm_bindgen::JsCast;
impl<T> ParseTable<T>
where
    T: DeserializeOwned + AsRef<[f32]>,
{
    pub fn new(table: JsValue) -> Self {
        let table = table.dyn_into().unwrap();
        let idx = 0;
        let next_val_ready = None;
        Self {
            table,
            idx,
            next_val_ready,
        }
    }
}

use serde::de::DeserializeOwned;
use std::pin::Pin;
use std::task::{Context, Poll};
impl<T> Stream for ParseTable<T>
where
    T: DeserializeOwned + AsRef<[f32]> + Unpin,
{
    type Item = T;

    /// Attempt to resolve the next item in the stream.
    /// Returns `Poll::Pending` if not ready, `Poll::Ready(Some(x))` if a value
    /// is ready, and `Poll::Ready(None)` if the stream has completed.
    fn poll_next(mut self: Pin<&mut Self>, _cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        // Deserialize row by row.
        let len = self.table.length();
        if self.idx == len {
            Poll::Ready(None)
        } else {
            // Check whether the next value has been parsed
            if let Some(next_val) = self.next_val_ready.take() {
                self.idx += 1;
                Poll::Ready(Some(next_val))
            } else {
                // Parse the next value and pends the stream
                // if serde returns an error while parsing the row
                // it will be converted to a None and discarded
                self.next_val_ready = self.table.get(self.idx).into_serde::<Self::Item>().ok();
                if self.next_val_ready.is_none() {
                    // serde failed parsing the row
                    self.idx += 1;
                }
                Poll::Pending
            }
        }
    }
}
use rand::rngs::StdRng;
use rand::Rng;
use rand::SeedableRng;
pub struct BuildCatalogIndex {
    pub sources: Vec<Source>,
    num_sorted_sources: usize,
    i: usize,
    j: usize,
    merging: bool,
    new_sorted_sources: Vec<Source>,
    ready: bool,
    chunk_size: usize,
    prev_num_sorted_sources: usize,
}
impl BuildCatalogIndex {
    pub fn new(sources: Vec<Source>) -> Self {
        let num_sorted_sources = 0;
        let merging = false;
        let new_sorted_sources = vec![];
        let i = 0;
        let j = 0;
        let ready = false;
        let prev_num_sorted_sources = 0;
        let chunk_size = 0;
        Self {
            num_sorted_sources,
            merging,
            i,
            j,
            new_sorted_sources,
            sources,
            ready,
            prev_num_sorted_sources,
            chunk_size,
        }
    }
}
const CHUNK_OF_SOURCES_TO_SORT: usize = 1000;
const CHUNK_OF_SORTED_SOURCES_TO_MERGE: usize = 20000;

impl Stream for BuildCatalogIndex {
    type Item = ();

    /// Attempt to resolve the next item in the stream.
    /// Returns `Poll::Pending` if not ready, `Poll::Ready(Some(x))` if a value
    /// is ready, and `Poll::Ready(None)` if the stream has completed.
    fn poll_next(mut self: Pin<&mut Self>, _cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        // The sources are split into equal sized chunks
        if self.sources.len() == self.num_sorted_sources {
            self.ready = true;
            Poll::Ready(None)
        } else {
            let a = self.num_sorted_sources;
            let b = (a + CHUNK_OF_SOURCES_TO_SORT).min(self.sources.len());
            // Get a new chunk and sort it
            if !self.merging {
                let mut rng = StdRng::seed_from_u64(0);
                // Get the chunk to sort
                (&mut self.sources[a..b]).sort_unstable_by(|s1, s2| {
                    let idx1 = healpix::nested::hash(7, s1.lon as f64, s1.lat as f64);
                    let idx2 = healpix::nested::hash(7, s2.lon as f64, s2.lat as f64);

                    let ordering = idx1.partial_cmp(&idx2).unwrap();
                    match ordering {
                        std::cmp::Ordering::Equal => {
                            rng.gen::<f64>().partial_cmp(&0.5).unwrap()
                            //s1.lon.partial_cmp(&s2.lon).unwrap()
                        }
                        _ => ordering,
                    }
                    //ordering
                });

                self.chunk_size = b - a;
                self.prev_num_sorted_sources = a;

                self.i = 0;
                self.j = a;
                self.num_sorted_sources = 0;
                self.new_sorted_sources = Vec::with_capacity(b);

                self.merging = true;
            } else {
                // Merge the sorted chunk with the sources already sorted
                //let (sorted_sources, chunk) = (&self.sources[..b]).split_at(a);

                // Merge the sorted chunk with sources that have been
                // already sorted
                let final_size = self.new_sorted_sources.capacity();
                while self.num_sorted_sources < final_size {
                    let v = if self.j == self.prev_num_sorted_sources + self.chunk_size {
                        let v = self.sources[self.i].clone();
                        self.i += 1;
                        v
                    } else if self.i == self.prev_num_sorted_sources {
                        let v = self.sources[self.j].clone();
                        self.j += 1;
                        v
                    } else {
                        let s1 = &self.sources[self.j];
                        let s2 = &self.sources[self.i];
                        let p1 = healpix::nested::hash(7, s1.lon as f64, s1.lat as f64);
                        let p2 = healpix::nested::hash(7, s2.lon as f64, s2.lat as f64);
                        if p1 <= p2 {
                            let v = self.sources[self.j].clone();
                            self.j += 1;
                            v
                        } else {
                            let v = self.sources[self.i].clone();
                            self.i += 1;
                            v
                        }
                    };

                    self.new_sorted_sources.push(v);
                    self.num_sorted_sources += 1;

                    // Every 10000 items sorted, we do a pending
                    if self.num_sorted_sources % CHUNK_OF_SORTED_SOURCES_TO_MERGE == 0 {
                        return Poll::Pending;
                    }
                }
                // replace 0 -> num_sorted_sources
                let end = self.num_sorted_sources;
                let new_sorted_sources = self.new_sorted_sources.clone();
                self.sources.splice(..end, new_sorted_sources);
                self.merging = false;
            }

            Poll::Pending
        }
    }
}

use cgmath::Vector3;

/// Task that send a tile to the GPU
pub struct SendTileToGPU {
    offset: Vector3<i32>,
    image: Box<dyn Image>,
    texture_array: Rc<Texture2DArray>,
}

use crate::buffer::{HiPSConfig, Image, Texture};
use crate::core::Texture2DArray;

use std::rc::Rc;
impl SendTileToGPU {
    pub fn new<I: Image + 'static>(
        tile: &Tile, // The tile cell. It must lie in the texture
        texture: &Texture,
        image: I,
        texture_array: Rc<Texture2DArray>,
        conf: &HiPSConfig,
    ) -> SendTileToGPU {
        let cell = tile.cell;
        // Index of the texture in the total set of textures
        let texture_idx = texture.idx();
        // Index of the slice of textures
        let idx_slice = texture_idx / conf.num_textures_by_slice();
        // Index of the texture in its slice
        let idx_in_slice = texture_idx % conf.num_textures_by_slice();

        // Index of the column of the texture in its slice
        let idx_col_in_slice = idx_in_slice / conf.num_textures_by_side_slice();
        // Index of the row of the texture in its slice
        let idx_row_in_slice = idx_in_slice % conf.num_textures_by_side_slice();

        // Row and column indexes of the tile in its texture
        let (idx_col_in_tex, idx_row_in_tex) = cell.get_offset_in_texture_cell(conf);

        // The size of the global texture containing the tiles
        let texture_size = conf.get_texture_size();
        // The size of a tile in its texture
        let tile_size = conf.get_tile_size();

        // Offset in the slice in pixels
        let offset = Vector3::new(
            (idx_row_in_slice as i32) * texture_size + (idx_row_in_tex as i32) * tile_size,
            (idx_col_in_slice as i32) * texture_size + (idx_col_in_tex as i32) * tile_size,
            idx_slice,
        );

        let image = Box::new(image) as Box<dyn Image>;
        SendTileToGPU {
            offset,
            image,
            texture_array,
        }
    }
}

use futures::Future;
impl Future for SendTileToGPU {
    type Output = ();

    fn poll(self: Pin<&mut Self>, _cx: &mut Context) -> Poll<Self::Output> {
        self.image
            .tex_sub_image_3d(&self.texture_array, &self.offset);

        Poll::Ready(())
    }
}
