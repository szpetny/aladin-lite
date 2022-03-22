use serde::Deserialize;

use wasm_bindgen::JsCast;
use wasm_bindgen::JsValue;
use wasm_bindgen::prelude::wasm_bindgen;

#[cfg(feature = "webgl2")]
pub type WebGlRenderingCtx = web_sys::WebGl2RenderingContext;
#[cfg(feature = "webgl1")]
pub type WebGlRenderingCtx = web_sys::WebGlRenderingContext;

#[derive(Deserialize, Debug)]
#[derive(Clone, Copy)]
#[serde(rename_all = "camelCase")]
#[wasm_bindgen]
pub struct BlendCfg {
    pub src_color_factor: BlendFactor,
    pub dst_color_factor: BlendFactor,
    pub func: BlendFunc,
}

impl Default for BlendCfg {
    fn default() -> Self {
        Self {
            src_color_factor: BlendFactor::SrcAlpha,
            dst_color_factor: BlendFactor::OneMinusConstantAlpha,
            func: BlendFunc::FuncAdd,
        }
    }
}

#[derive(Deserialize, Debug)]
#[derive(Clone, Copy)]
#[derive(PartialEq)]
#[wasm_bindgen]
pub enum BlendFactor {
    Zero,
    One,
    
    SrcColor,
    OneMinusSrcColor,

    DstColor,
    OneMinusDstColor,

    SrcAlpha,
    OneMinusSrcAlpha,

    DstAlpha,
    OneMinusDstAlpha,

    ConstantColor,
    OneMinusConstantColor,
    ConstantAlpha,
    OneMinusConstantAlpha,
}

impl BlendFactor {
    // Map the blend factor into the WebGL value
    fn gl(&self) -> u32 {
        match self {
            BlendFactor::ConstantAlpha => WebGlRenderingCtx::CONSTANT_ALPHA,
            BlendFactor::ConstantColor => WebGlRenderingCtx::CONSTANT_COLOR,
            BlendFactor::Zero => WebGlRenderingCtx::ZERO,
            BlendFactor::One => WebGlRenderingCtx::ONE,
            BlendFactor::DstAlpha => WebGlRenderingCtx::DST_ALPHA,
            BlendFactor::DstColor => WebGlRenderingCtx::DST_COLOR,
            BlendFactor::OneMinusConstantAlpha => WebGlRenderingCtx::ONE_MINUS_CONSTANT_ALPHA,
            BlendFactor::OneMinusDstColor => WebGlRenderingCtx::ONE_MINUS_DST_COLOR,
            BlendFactor::OneMinusDstAlpha => WebGlRenderingCtx::ONE_MINUS_DST_ALPHA,
            BlendFactor::SrcAlpha => WebGlRenderingCtx::SRC_ALPHA,
            BlendFactor::SrcColor => WebGlRenderingCtx::SRC_COLOR,
            BlendFactor::OneMinusSrcColor => WebGlRenderingCtx::ONE_MINUS_SRC_COLOR,
            BlendFactor::OneMinusSrcAlpha => WebGlRenderingCtx::ONE_MINUS_SRC_ALPHA,
            BlendFactor::OneMinusConstantColor => WebGlRenderingCtx::ONE_MINUS_CONSTANT_ALPHA,
        }
    }
}

#[derive(Deserialize, Debug)]
#[derive(Clone, Copy)]
#[derive(PartialEq)]
#[wasm_bindgen]
pub enum BlendFunc {
    FuncAdd,
    FuncSubstract,
    FuncReverseSubstract,
    #[cfg(feature = "webgl2")]
    Min,
    #[cfg(feature = "webgl2")]
    Max
}

impl BlendFunc {
    fn gl(&self) -> u32 {
        match self {
            BlendFunc::FuncAdd => WebGlRenderingCtx::FUNC_ADD,
            BlendFunc::FuncSubstract => WebGlRenderingCtx::FUNC_SUBTRACT,
            BlendFunc::FuncReverseSubstract => WebGlRenderingCtx::FUNC_REVERSE_SUBTRACT,
            BlendFunc::Min => WebGlRenderingCtx::MIN,
            BlendFunc::Max => WebGlRenderingCtx::MAX,
        }
    }
}

use std::fmt;
impl fmt::Display for BlendFactor {
    // This trait requires `fmt` with this exact signature.
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        // Write strictly the first element into the supplied output
        // stream: `f`. Returns `fmt::Result` which indicates whether the
        // operation succeeded or failed. Note that `write!` uses syntax which
        // is very similar to `println!`.
        let str = match self {
            BlendFactor::ConstantAlpha => "ConstantAlpha",
            BlendFactor::ConstantColor => "ConstantColor",
            BlendFactor::Zero => "Zero",
            BlendFactor::One => "One",
            BlendFactor::DstAlpha => "DstAlpha",
            BlendFactor::DstColor => "DstColor",
            BlendFactor::OneMinusConstantAlpha => "OneMinusConstantAlpha",
            BlendFactor::OneMinusDstColor => "OneMinusDstColor",
            BlendFactor::OneMinusDstAlpha => "OneMinusDstAlpha",
            BlendFactor::SrcAlpha => "SrcAlpha",
            BlendFactor::SrcColor => "SrcColor",
            BlendFactor::OneMinusSrcColor => "OneMinusSrcColor",
            BlendFactor::OneMinusSrcAlpha => "OneMinusSrcAlpha",
            BlendFactor::OneMinusConstantColor => "OneMinusConstantColor",
        };
        write!(f, "{}", str)
    }
}
impl fmt::Display for BlendFunc {
    // This trait requires `fmt` with this exact signature.
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        // Write strictly the first element into the supplied output
        // stream: `f`. Returns `fmt::Result` which indicates whether the
        // operation succeeded or failed. Note that `write!` uses syntax which
        // is very similar to `println!`.
        let str = match self {
            BlendFunc::FuncAdd => "Add",
            BlendFunc::FuncSubstract => "Subtract",
            BlendFunc::FuncReverseSubstract => "Reverse Subtract",
            #[cfg(feature = "webgl2")]
            BlendFunc::Min => "Min",
            #[cfg(feature = "webgl2")]
            BlendFunc::Max => "Max",
        };
        write!(f, "{}", str)
    }
}