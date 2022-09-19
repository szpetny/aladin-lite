/******************************************************************************
 * Aladin Lite project
 * 
 * File MOC
 *
 * This class represents a MOC (Multi Order Coverage map) layer
 * 
 * Author: Thomas Boch[CDS]
 * 
 *****************************************************************************/

import { astro }   from "./libs/fits.js";
import { CooFrameEnum }   from "./CooFrameEnum.js";
import { Aladin }   from "./Aladin.js";
import { ProjectionEnum } from "./ProjectionEnum.js";
import { Utils }   from "./Utils.js";
import { AladinUtils }   from "./AladinUtils.js";
import { CooConversion }   from "./CooConversion.js";
import { Color } from "./Color";


export let MOC = (function() {
    let MOC = function(options) {
        //this.order = undefined;

        this.uuid = Utils.uuidv4();
        this.type = 'moc';

        // TODO homogenize options parsing for all kind of overlay (footprints, catalog, MOC)
        options = options || {};
        this.name = options.name || "MOC";

        this.color = options.color || Color.getNextColor();
        this.color = Color.standardizeColor(this.color);
        
        this.opacity = options.opacity || 1;

        this.opacity = Math.max(0, Math.min(1, this.opacity)); // 0 <= this.opacity <= 1
        this.lineWidth = options["lineWidth"] || 1;
        this.adaptativeDisplay = options['adaptativeDisplay'] !== false;

        //this.proxyCalled = false; // this is a flag to check whether we already tried to load the MOC through the proxy

        // index of MOC cells at high and low resolution
        /*this._highResIndexOrder3 = new Array(768);
        this._lowResIndexOrder3 = new Array(768);
        for (var k=0; k<768; k++) {
            this._highResIndexOrder3[k] = {};
            this._lowResIndexOrder3[k] = {};
        }

        this.nbCellsDeepestLevel = 0; // needed to compute the sky fraction of the MOC*/

        this.isShowing = true;
        this.ready = false;
    }

    /*function log2(val) {
        return Math.log(val) / Math.LN2;
    }*/

    // max norder we can currently handle (limitation of healpix.js)
    //MOC.MAX_NORDER = 13; // NSIDE = 8192

    //MOC.LOWRES_MAXORDER = 6; // 5 or 6 ??
    //MOC.HIGHRES_MAXORDER = 11; // ??

    // TODO: options to modifiy this ?
    //MOC.PIVOT_FOV = 30; // when do we switch from low res cells to high res cells (fov in degrees)

    // at end of parsing, we need to remove duplicates from the 2 indexes
    /*MOC.prototype._removeDuplicatesFromIndexes = function() {
        var a, aDedup;
        for (var k=0; k<768; k++) {
            for (var key in this._highResIndexOrder3[k]) {
                a = this._highResIndexOrder3[k][key];
                aDedup = uniq(a);
                this._highResIndexOrder3[k][key] = aDedup;
            }
            for (var key in this._lowResIndexOrder3[k]) {
                a = this._lowResIndexOrder3[k][key];
                aDedup = uniq(a);
                this._lowResIndexOrder3[k][key] = aDedup;
            }
        }
        
    }*/

    // add pixel (order, ipix)
    /*MOC.prototype._addPix = function(order, ipix) {
        var ipixOrder3 = Math.floor( ipix * Math.pow(4, (3 - order)) );
        // fill low and high level cells
        // 1. if order <= LOWRES_MAXORDER, just store value in low and high res cells
        if (order<=MOC.LOWRES_MAXORDER) {
            if (! (order in this._lowResIndexOrder3[ipixOrder3])) {
                this._lowResIndexOrder3[ipixOrder3][order] = [];
                this._highResIndexOrder3[ipixOrder3][order] = [];
            }
            this._lowResIndexOrder3[ipixOrder3][order].push(ipix);
            this._highResIndexOrder3[ipixOrder3][order].push(ipix);
        }
        // 2. if LOWRES_MAXORDER < order <= HIGHRES_MAXORDER , degrade ipix for low res cells
        else if (order<=MOC.HIGHRES_MAXORDER) {
            if (! (order in this._highResIndexOrder3[ipixOrder3])) {
                this._highResIndexOrder3[ipixOrder3][order] = [];
            }
            this._highResIndexOrder3[ipixOrder3][order].push(ipix);
            
            var degradedOrder = MOC.LOWRES_MAXORDER; 
            var degradedIpix  = Math.floor(ipix / Math.pow(4, (order - degradedOrder)));
            var degradedIpixOrder3 = Math.floor( degradedIpix * Math.pow(4, (3 - degradedOrder)) );
            if (! (degradedOrder in this._lowResIndexOrder3[degradedIpixOrder3])) {
                this._lowResIndexOrder3[degradedIpixOrder3][degradedOrder]= [];
            }
            this._lowResIndexOrder3[degradedIpixOrder3][degradedOrder].push(degradedIpix);
        }
        // 3. if order > HIGHRES_MAXORDER , degrade ipix for low res and high res cells
        else {
            // low res cells
            var degradedOrder = MOC.LOWRES_MAXORDER; 
            var degradedIpix  = Math.floor(ipix / Math.pow(4, (order - degradedOrder)));
            var degradedIpixOrder3 = Math.floor(degradedIpix * Math.pow(4, (3 - degradedOrder)) );
            if (! (degradedOrder in this._lowResIndexOrder3[degradedIpixOrder3])) {
                this._lowResIndexOrder3[degradedIpixOrder3][degradedOrder]= [];
            }
            this._lowResIndexOrder3[degradedIpixOrder3][degradedOrder].push(degradedIpix);

            
            // high res cells
            degradedOrder = MOC.HIGHRES_MAXORDER; 
            degradedIpix  = Math.floor(ipix / Math.pow(4, (order - degradedOrder)));
            var degradedIpixOrder3 = Math.floor(degradedIpix * Math.pow(4, (3 - degradedOrder)) );
            if (! (degradedOrder in this._highResIndexOrder3[degradedIpixOrder3])) {
                this._highResIndexOrder3[degradedIpixOrder3][degradedOrder]= [];
            }
            this._highResIndexOrder3[degradedIpixOrder3][degradedOrder].push(degradedIpix);
        }

        this.nbCellsDeepestLevel += Math.pow(4, (this.order - order));
    };*/


    /**
     *  Return a value between 0 and 1 denoting the fraction of the sky
     *  covered by the MOC
     */
    MOC.prototype.skyFraction = function() {
        if (this.view) {
            // update the new moc params to the backend
            //return this.view.aladin.webglAPI.mocSkyFraction(this.mocParams);
        }
    };

    /**
     * set MOC data by parsing a MOC serialized in JSON
     * (as defined in IVOA MOC document, section 3.1.1)
     */
    MOC.prototype.dataFromJSON = function(jsonMOC) {
        /*var order, ipix;
        // 1. Compute the order (order of the deepest cells contained in the moc)
        for (var orderStr in jsonMOC) {
            if (jsonMOC.hasOwnProperty(orderStr)) {
                order = parseInt(orderStr);
                if (this.order===undefined || order > this.order) {
                    this.order = order;
                }
            }
        }

        // 2. Build the mocs (LOW and HIGH res ones)
        for (var orderStr in jsonMOC) {
            if (jsonMOC.hasOwnProperty(orderStr)) {
                order = parseInt(orderStr);
                for (var k=0; k<jsonMOC[orderStr].length; k++) {
                    ipix = jsonMOC[orderStr][k];
                    this._addPix(order, ipix);
                }
            }
        }

        this.reportChange();*/
        this.ready = true;
        this.dataJSON = jsonMOC;
    };

    /**
     * set MOC data by parsing a URL pointing to a FITS MOC file
     */
    MOC.prototype.dataFromFITSURL = function(mocURL, successCallback) {
        var self = this;
        /*var callback = function() {
            // note: in the callback, 'this' refers to the FITS instance

            // first, let's find MOC norder
            var hdr0;
            try {
                // A zero-length hdus array might mean the served URL does not have CORS header
                // --> let's try again through the proxy
                if (this.hdus.length == 0) {
                    if (self.proxyCalled !== true) {
                        self.proxyCalled = true;
                        var proxiedURL = Aladin.JSONP_PROXY + '?url=' + encodeURIComponent(self.dataURL);
                        new astro.FITS(proxiedURL, callback);
                    }

                    return;
                }
                hdr0 = this.getHeader(0);
            }
            catch (e) {
                console.error('Could not get header of extension #0');
                return;
            }
            var hdr1 = this.getHeader(1);

            if (hdr0.contains('HPXMOC')) {
                self.order = hdr0.get('HPXMOC')
            }
            else if (hdr0.contains('MOCORDER')) {
                self.order = hdr0.get('MOCORDER')
            }
            else if (hdr1.contains('HPXMOC')) {
                self.order = hdr1.get('HPXMOC')
            }
            else if (hdr1.contains('MOCORDER')) {
                self.order = hdr1.get('MOCORDER')
            }
            else {
                console.error('Can not find MOC order in FITS file');
                return;
            }

            var data = this.getDataUnit(1);
            var colName = data.columns[0];
            data.getRows(0, data.rows, function(rows) {
                for (var k=0; k<rows.length; k++) {
                    var uniq = rows[k][colName];
                    var order = Math.floor(Math.floor(log2(Math.floor(uniq/4))) / 2);
                    var ipix = uniq - 4 *(Math.pow(4, order));



                    self._addPix(order, ipix);
                }

            });
            data = null; // this helps releasing memory

            self._removeDuplicatesFromIndexes();

            if (successCallback) {
                successCallback();
            }

            self.reportChange();
            self.ready = true;
        }; // end of callback function
        */
        this.dataURL = mocURL;
        this.successCallback = successCallback;

        // instantiate the FITS object which will fetch the URL passed as parameter
        //new astro.FITS(this.dataURL, callback);
    };

    MOC.prototype.setView = function(view) {
        this.view = view;
        this.mocParams = new Aladin.wasmLibs.webgl.MOC(this.uuid, this.opacity, this.lineWidth, this.adaptativeDisplay, this.isShowing, this.color);

        if (this.dataURL) {
            view.aladin.webglAPI.addFITSMoc(this.mocParams, this.dataURL);
        } else if (this.dataFromJSON) {
            view.aladin.webglAPI.addJSONMoc(this.mocParams, this.dataJSON);
        }

        if (this.successCallback) {
            this.successCallback();
        }

        view.requestRedraw();
    };

    /*MOC.prototype.draw = function(ctx, projection, viewFrame, width, height, largestDim, zoomFactor, fov) {
        if (! this.isShowing || ! this.ready) {
            return;
        }
        var mocCells = fov > MOC.PIVOT_FOV && this.adaptativeDisplay ? this._lowResIndexOrder3 : this._highResIndexOrder3;

        this._drawCells(ctx, mocCells, fov, projection, viewFrame, CooFrameEnum.J2000, width, height, largestDim, zoomFactor);
    };

    MOC.prototype._drawCells = function(ctx, mocCellsIdxOrder3, fov, projection, viewFrame, surveyFrame, width, height, largestDim, zoomFactor) {
        ctx.lineWidth = this.lineWidth;
        // if opacity==1, we draw solid lines, else we fill each HEALPix cell
        if (this.opacity==1) {
            ctx.strokeStyle = this.color;
        }
        else {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
        }


        ctx.beginPath();

        var orderedKeys = [];
        for (var k=0; k<768; k++) {
            var mocCells = mocCellsIdxOrder3[k];
            for (var key in mocCells) {
                orderedKeys.push(parseInt(key));
            }
        }
        orderedKeys.sort(function(a, b) {return a - b;});
        var norderMax = orderedKeys[orderedKeys.length-1];

        var nside, xyCorners, ipix;
        var potentialVisibleHpxCellsOrder3 = this.view.getVisiblePixList(3);
        var visibleHpxCellsOrder3 = [];
        // let's test first all potential visible cells and keep only the one with a projection inside the view
        for (var k=0; k<potentialVisibleHpxCellsOrder3.length; k++) {
            var ipix = potentialVisibleHpxCellsOrder3[k];
            xyCorners = getXYCorners(8, ipix, viewFrame, surveyFrame, width, height, largestDim, zoomFactor, projection, this.view);
            if (xyCorners) {
                visibleHpxCellsOrder3.push(ipix);
            }
        }

        var counter = 0;
        var mocCells;
        var norder3Ipix;
        for (var norder=0; norder<=norderMax; norder++) {
            nside = 1 << norder;

            for (var i=0; i<visibleHpxCellsOrder3.length; i++) {
                var ipixOrder3 = visibleHpxCellsOrder3[i];
                mocCells = mocCellsIdxOrder3[ipixOrder3];
                if (typeof mocCells[norder]==='undefined') {
                    continue;
                }
            
                if (norder<=3) {
                    for (var j=0; j<mocCells[norder].length; j++) {
                        ipix = mocCells[norder][j];
                        var factor = Math.pow(4, (3-norder));
                        var startIpix = ipix * factor;
                        for (var k=0; k<factor; k++) {
                            norder3Ipix = startIpix + k;
                            xyCorners = getXYCorners(8, norder3Ipix, viewFrame, surveyFrame, width, height, largestDim, zoomFactor, projection, this.view);
                            if (xyCorners) {
                                drawCorners(ctx, xyCorners);
                            }
                        }
                    }
                }
                else {
                    for (var j=0; j<mocCells[norder].length; j++) {
                        ipix = mocCells[norder][j];
                        var parentIpixOrder3 = Math.floor(ipix/Math.pow(4, norder-3));
                        xyCorners = getXYCorners(nside, ipix, viewFrame, surveyFrame, width, height, largestDim, zoomFactor, projection, this.view);
                        if (xyCorners) {
                            drawCorners(ctx, xyCorners);
                        }
                    }
                }
            }
        }


        if (this.opacity==1) {
            ctx.stroke();
        }
        else {
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
    };

    var drawCorners = function(ctx, xyCorners) {
        ctx.moveTo(xyCorners[0].vx, xyCorners[0].vy);
        ctx.lineTo(xyCorners[1].vx, xyCorners[1].vy);
        ctx.lineTo(xyCorners[2].vx, xyCorners[2].vy);
        ctx.lineTo(xyCorners[3].vx, xyCorners[3].vy);
        ctx.lineTo(xyCorners[0].vx, xyCorners[0].vy);
    }

    // remove duplicate items from array a
    var uniq = function(a) {
        var seen = {};
        var out = [];
        var len = a.length;
        var j = 0;
        for (var i = 0; i < len; i++) {
            var item = a[i];
            if (seen[item] !== 1) {
                seen[item] = 1;
                out[j++] = item;
            }
        }

        return out;
    };*/

    MOC.prototype.reportChange = function() {
        if (this.view) {
            // update the new moc params to the backend
            this.mocParams = new Aladin.wasmLibs.webgl.MOC(this.uuid, this.opacity, this.lineWidth, this.adaptativeDisplay, this.isShowing, this.color);
            this.view.aladin.webglAPI.setMocParams(this.mocParams);
            this.view.requestRedraw();
        }
    };

    MOC.prototype.delete = function() {
        if (this.view) {
            // update the new moc params to the backend
            this.view.aladin.webglAPI.removeMoc(this.mocParams);
            this.view.requestRedraw();
        }
    };

    MOC.prototype.show = function() {
        if (this.isShowing) {
            return;
        }
        this.isShowing = true;
        this.reportChange();
    };

    MOC.prototype.hide = function() {
        if (! this.isShowing) {
            return;
        }
        this.isShowing = false;
        this.reportChange();
    };

    // Tests whether a given (ra, dec) point on the sky is within the current MOC object
    //
    // returns true if point is contained, false otherwise
    MOC.prototype.contains = function(ra, dec) {
        /*var hpxIdx = new HealpixIndex(Math.pow(2, this.order));
        hpxIdx.init();
        var polar = HealpixIndex.utils.radecToPolar(ra, dec);
        var ipix = hpxIdx.ang2pix_nest(polar.theta, polar.phi);
        var ipixMapByOrder = {};
        for (var curOrder=0; curOrder<=this.order; curOrder++) {
            ipixMapByOrder[curOrder] = Math.floor(ipix / Math.pow(4, this.order - curOrder));
        }

        // first look for large HEALPix cells (order<3)
        for (var ipixOrder3=0; ipixOrder3<768; ipixOrder3++) {
            var mocCells = this._highResIndexOrder3[ipixOrder3];
            for (var order in mocCells) {
                if (order<3) {
                    for (var k=mocCells[order].length; k>=0; k--) {
                        if (ipixMapByOrder[order] == mocCells[order][k]) {
                            return true;
                        }   
                    }
                }
            }
        }

        // look for finer cells
        var ipixOrder3 = ipixMapByOrder[3];
        var mocCells = this._highResIndexOrder3[ipixOrder3];
        for (var order in mocCells) {
            for (var k=mocCells[order].length; k>=0; k--) {
                if (ipixMapByOrder[order] == mocCells[order][k]) {
                    return true;
                }   
            }
        }

        return false;*/
        /*if (this.view) {
            console.log(this.mocParams)
            // update the new moc params to the backend
            return this.view.aladin.webglAPI.mocContains(this.mocParams, ra, dec);
        }*/
    };

    return MOC;

})();

    
