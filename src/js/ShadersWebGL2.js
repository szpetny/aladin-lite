/* Import all the shaders here*/ 
// Catalog shaders
import CatalogAitoffVS from '../glsl/webgl2/catalogs/aitoff.vert';
import CatalogMercatVS from '../glsl/webgl2/catalogs/mercator.vert';
import CatalogArcVS from '../glsl/webgl2/catalogs/arc.vert';
import CatalogTanVS from '../glsl/webgl2/catalogs/tan.vert';
import CatalogMollVS from '../glsl/webgl2/catalogs/mollweide.vert';
import CatalogHEALPixVS from '../glsl/webgl2/catalogs/healpix.vert';
import CatalogOrthoVS from '../glsl/webgl2/catalogs/ortho.vert';
import CatalogOrthoFS from '../glsl/webgl2/catalogs/ortho.frag';
import CatalogFS from '../glsl/webgl2/catalogs/catalog.frag';

// Colormap shaders
import ColormapCatalogVS from '../glsl/webgl2/colormaps/colormap.vert'
import ColormapCatalogFS from '../glsl/webgl2/colormaps/colormap.frag'

// Grid shader
import GridVS from '../glsl/webgl2/grid/grid.vert'
import GridAitoffFS from '../glsl/webgl2/grid/aitoff.frag'
import GridMollFS from '../glsl/webgl2/grid/mollweide.frag'
import GridOrthoFS from '../glsl/webgl2/grid/ortho.frag'
import GridMercatorFS from '../glsl/webgl2/grid/mercator.frag'
import GridArcFS from '../glsl/webgl2/grid/arc.frag'
import GridTanFS from '../glsl/webgl2/grid/tan.frag'
import GridVS_CPU from '../glsl/webgl2/grid/grid_cpu.vert'
import GridFS_CPU from '../glsl/webgl2/grid/grid_cpu.frag'

// HiPS shaders
// Raytracer
import RayTracerVS from '../glsl/webgl2/hips/raytracer/raytracer.vert'
import RayTracerColorFS from '../glsl/webgl2/hips/raytracer/color.frag'
import RayTracerGrayscale2ColorFS from '../glsl/webgl2/hips/raytracer/grayscale_to_color.frag'
import RayTracerGrayscale2ColormapFS from '../glsl/webgl2/hips/raytracer/grayscale_to_colormap.frag'
import RayTracerGrayscale2ColorIntegerFS from '../glsl/webgl2/hips/raytracer/grayscale_to_color_i.frag'
import RayTracerGrayscale2ColormapIntegerFS from '../glsl/webgl2/hips/raytracer/grayscale_to_colormap_i.frag'
import RayTracerGrayscale2ColorUnsignedFS from '../glsl/webgl2/hips/raytracer/grayscale_to_color_u.frag'
import RayTracerGrayscale2ColormapUnsignedFS from '../glsl/webgl2/hips/raytracer/grayscale_to_colormap_u.frag'
// Rasterizer
import RasterizerOrthoVS from '../glsl/webgl2/hips/rasterizer/ortho.vert'
import RasterizerHEALPixVS from '../glsl/webgl2/hips/rasterizer/healpix.vert'
import RasterizerMercatorVS from '../glsl/webgl2/hips/rasterizer/mercator.vert'
import RasterizerAitoffVS from '../glsl/webgl2/hips/rasterizer/aitoff.vert'
import RasterizerGnomonicVS from '../glsl/webgl2/hips/rasterizer/gnomonic.vert'
import RasterizerArcVS from '../glsl/webgl2/hips/rasterizer/arc.vert'
import RasterizerMollVS from '../glsl/webgl2/hips/rasterizer/mollweide.vert'
import RasterizerColorFS from '../glsl/webgl2/hips/rasterizer/color.frag'
import RasterizerGrayscale2ColorFS from '../glsl/webgl2/hips/rasterizer/grayscale_to_color.frag'
import RasterizerGrayscale2ColormapFS from '../glsl/webgl2/hips/rasterizer/grayscale_to_colormap.frag'
import RasterizerGrayscale2ColorIntegerFS from '../glsl/webgl2/hips/rasterizer/grayscale_to_color_i.frag'
import RasterizerGrayscale2ColormapIntegerFS from '../glsl/webgl2/hips/rasterizer/grayscale_to_colormap_i.frag'
import RasterizerGrayscale2ColorUnsignedFS from '../glsl/webgl2/hips/rasterizer/grayscale_to_color_u.frag'
import RasterizerGrayscale2ColormapUnsignedFS from '../glsl/webgl2/hips/rasterizer/grayscale_to_colormap_u.frag'

let shaders = [
    // Catalog shaders
    {
        id: "CatalogAitoffVS",
        content: CatalogAitoffVS,
    },
    {
        id: "CatalogHEALPixVS",
        content: CatalogHEALPixVS,
    },
    {
        id: "CatalogMercatVS",
        content: CatalogMercatVS,
    },
    {
        id: "CatalogArcVS",
        content: CatalogArcVS,
    },
    {
        id: "CatalogTanVS",
        content: CatalogTanVS,
    },
    {
        id: "CatalogMollVS",
        content: CatalogMollVS,
    },
    {
        id: "CatalogOrthoVS",
        content: CatalogOrthoVS,
    },
    {
        id: "CatalogOrthoFS",
        content: CatalogOrthoFS,
    },
    {
        id: "CatalogFS",
        content: CatalogFS,    
    },
    // Colormap shaders
    {
        id: "ColormapCatalogVS",
        content: ColormapCatalogVS,
    },
    {
        id: "ColormapCatalogFS",
        content: ColormapCatalogFS,
    },
    // Grid shader
    {
        id: "GridVS",
        content: GridVS,
    },
    {
        id: "GridAitoffFS",
        content: GridAitoffFS,
    },
    {
        id: "GridMollFS",
        content: GridMollFS,
    },
    {
        id: "GridOrthoFS",
        content: GridOrthoFS,
    },
    {
        id: "GridMercatorFS",
        content: GridMercatorFS,
    },
    {
        id: "GridArcFS",
        content: GridArcFS,
    },
    {
        id: "GridTanFS",
        content: GridTanFS,
    },
    {
        id: "GridFS_CPU",
        content: GridFS_CPU,
    },
    {
        id: "GridVS_CPU",
        content: GridVS_CPU,
    },
    // HiPS shaders
    // Raytracer
    {
        id: "RayTracerVS",
        content: RayTracerVS,
    },
    {
        id: "RayTracerColorFS",
        content: RayTracerColorFS,
    },
    {
        id: "RayTracerGrayscale2ColorFS",
        content: RayTracerGrayscale2ColorFS,
    },
    {
        id: "RayTracerGrayscale2ColormapFS",
        content: RayTracerGrayscale2ColormapFS,
    },
    {
        id: "RayTracerGrayscale2ColorIntegerFS",
        content: RayTracerGrayscale2ColorIntegerFS,
    },
    {
        id: "RayTracerGrayscale2ColormapIntegerFS",
        content: RayTracerGrayscale2ColormapIntegerFS,
    },
    {
        id: "RayTracerGrayscale2ColorUnsignedFS",
        content: RayTracerGrayscale2ColorUnsignedFS,
    },
    {
        id: "RayTracerGrayscale2ColormapUnsignedFS",
        content: RayTracerGrayscale2ColormapUnsignedFS,
    },
    /// Rasterizer
    {
        id: "RasterizerOrthoVS",
        content: RasterizerOrthoVS,
    },
    {
        id: "RasterizerMercatorVS",
        content: RasterizerMercatorVS,
    },
    {
        id: "RasterizerAitoffVS",
        content: RasterizerAitoffVS,
    },
    {
        id: "RasterizerHEALPixVS",
        content: RasterizerHEALPixVS,
    },
    {
        id: "RasterizerArcVS",
        content: RasterizerArcVS,
    },
    {
        id: "RasterizerGnomonicVS",
        content: RasterizerGnomonicVS,
    },
    {
        id: "RasterizerMollVS",
        content: RasterizerMollVS,
    },
    {
        id: "RasterizerColorFS",
        content: RasterizerColorFS,
    },
    {
        id: "RasterizerGrayscale2ColorFS",
        content: RasterizerGrayscale2ColorFS,
    },
    {
        id: "RasterizerGrayscale2ColormapFS",
        content: RasterizerGrayscale2ColormapFS,
    },
    {
        id: "RasterizerGrayscale2ColorIntegerFS",
        content: RasterizerGrayscale2ColorIntegerFS,
    },
    {
        id: "RasterizerGrayscale2ColormapIntegerFS",
        content: RasterizerGrayscale2ColormapIntegerFS,
    },
    {
        id: "RasterizerGrayscale2ColorUnsignedFS",
        content: RasterizerGrayscale2ColorUnsignedFS,
    },
    {
        id: "RasterizerGrayscale2ColormapUnsignedFS",
        content: RasterizerGrayscale2ColormapUnsignedFS,
    },
];

export function loadShadersWebGL2() {
    return shaders;
}
