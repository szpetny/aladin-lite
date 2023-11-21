// Copyright 2023 - UDS/CNRS
// The Aladin Lite program is distributed under the terms
// of the GNU General Public License version 3.
//
// This file is part of Aladin Lite.
//
//    Aladin Lite is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, version 3 of the License.
//
//    Aladin Lite is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    The GNU General Public License is available in COPYING file
//    along with Aladin Lite.
//

import { Layout } from "../Layout";
import { ActionButton } from "../Widgets/ActionButton";
import { ImageLayer } from "../../ImageLayer.js";
import searchIconImg from '../../../../assets/icons/search.svg';
import { ALEvent } from "../../events/ALEvent";

import { DOMElement } from "../Widgets/Widget";

import { ContextMenu } from "../Widgets/ContextMenu";
import { HiPSSelectorBox } from "../HiPSSelectorBox";
import { requestAnimFrame } from "../../libs/RequestAnimationFrame";

/******************************************************************************
 * Aladin Lite project
 *
 * File gui/ActionButton.js
 *
 * A context menu that shows when the user right clicks, or long touch on touch device
 *
 *
 * Author: Matthieu Baumann[CDS]
 *
 *****************************************************************************/

/**
 * Class representing a Tabs layout
 * @extends DOMElement
 */
 export class HiPSInfo extends DOMElement {
    static previewImagesUrl = {
        'AllWISE color': 'https://aladin.cds.unistra.fr/AladinLite/survey-previews/P_allWISE_color.jpg',
        'DECaPS DR1 color': 'https://aladin.cds.unistra.fr/AladinLite/survey-previews/P_DECaLS_DR5_color.jpg',
        'DSS colored': 'https://aladin.cds.unistra.fr/AladinLite/survey-previews/P_DSS2_color.jpg',
        'DSS2 Red (F+R)': 'https://aladin.cds.unistra.fr/AladinLite/survey-previews/P_DSS2_red.jpg',
        'Density map for Gaia EDR3 (I/350/gaiaedr3)' : undefined,
        'Fermi color': 'https://aladin.cds.unistra.fr/AladinLite/survey-previews/P_Fermi_color.jpg',
        'GALEXGR6_7 NUV': 'https://aladin.cds.unistra.fr/AladinLite/survey-previews/P_GALEXGR6_7_color.jpg',
        'GLIMPSE360': 'https://aladin.cds.unistra.fr/AladinLite/survey-previews/P_GLIMPSE360.jpg',
        'Halpha': 'https://aladin.cds.unistra.fr/AladinLite/survey-previews/P_VTSS_Ha.jpg',
        'IRAC color I1,I2,I4 - (GLIMPSE, SAGE, SAGE-SMC, SINGS)': 'https://aladin.cds.unistra.fr/AladinLite/survey-previews/P_SPITZER_color.jpg',
        'IRIS colored': 'https://aladin.cds.unistra.fr/AladinLite/survey-previews/P_IRIS_color.jpg',
        'Mellinger colored': 'https://aladin.cds.unistra.fr/AladinLite/survey-previews/P_Mellinger_color.jpg',
        'PanSTARRS DR1 color': 'https://aladin.cds.unistra.fr/AladinLite/survey-previews/P_PanSTARRS_DR1_color-z-zg-g.jpg',
        'PanSTARRS DR1 g': undefined,
        '2MASS colored': 'https://aladin.cds.unistra.fr/AladinLite/survey-previews/P_2MASS_color.jpg',
        'AKARI colored': 'https://aladin.cds.unistra.fr/AladinLite/survey-previews/P_AKARI_FIS_Color.jpg',
        'SWIFT': 'https://aladin.cds.unistra.fr/AladinLite/survey-previews/P_SWIFT_BAT_FLUX.jpg',
        'VTSS-Ha': 'https://aladin.cds.unistra.fr/AladinLite/survey-previews/P_Finkbeiner.jpg',
        'XMM PN colored': 'https://aladin.cds.unistra.fr/AladinLite/survey-previews/P_XMM_PN_color.jpg',
        'SDSS9 colored': 'https://aladin.cds.unistra.fr/AladinLite/survey-previews/P_SDSS9_color.jpg',
    };

    /**
     * UI responsible for displaying the viewport infos
     * @param {Aladin} aladin - The aladin instance.
     */
    constructor(aladin, layerName = "base") {
        let hipsSelector;

        let layerChosenName;
        let tooltipOpt = {content: 'Change the survey <br /> (i.e. HST, DSS, SDSS)', position: { direction: 'bottom' }}

        let el = new ActionButton({
            tooltip: tooltipOpt,
            content: 'Main survey',
            cssStyle: {
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderColor: 'white',
                padding: '4px',
                cursor: 'pointer',
                maxWidth: '15em',
                overflow: 'hidden'
            },
            action(e) {
                let ctxMenu = ContextMenu.getInstance(aladin);
                ctxMenu._hide();

                let ctxMenuLayout = [{
                    label: Layout.horizontal({
                        layout: [
                            ActionButton.createIconBtn({
                                iconURL: searchIconImg,
                                tooltip: {content: 'Find a specific survey <br /> in our database...', position: { direction: 'bottom' }},
                                cssStyle: {
                                    backgroundPosition: 'center center',
                                    backgroundColor: '#bababa',
                                    border: '1px solid rgb(72, 72, 72)',
                                    cursor: 'help',
                                },
                            }),
                            'Search for a new survey'
                        ]
                    }),
                    action(o) {
                        if (!hipsSelector) {
                            hipsSelector = new HiPSSelectorBox(aladin, aladin.getOverlayImageLayer(layerName));
                        }

                        hipsSelector._show();
                    }
                }];
                
                let layers = ImageLayer.LAYERS.sort(function (a, b) {
                    if (!a.order) {
                        return a.name > b.name ? 1 : -1;
                    }
                    return a.maxOrder && a.maxOrder > b.maxOrder ? 1 : -1;
                });
        
                let action = (e) => {
                    let name = e.srcElement.innerText;
                    let cfg = ImageLayer.LAYERS.find((layer) => layer.name === name);
                    let newLayer;
                    
                    // Max order is specific for surveys
                    if (cfg.subtype === "fits") {
                        // FITS
                        newLayer = aladin.createImageFITS(
                            cfg.url,
                            cfg.name,
                            cfg.options,
                        );
                    } else {
                        // HiPS
                        newLayer = aladin.createImageSurvey(
                            cfg.id,
                            cfg.name,
                            cfg.url,
                            undefined,
                            cfg.maxOrder,
                            cfg.options
                        );
                    }
        
                    aladin.setOverlayImageLayer(newLayer, layerName);
                }

                for(let layer of layers) {
                    let backgroundUrl = HiPSInfo.previewImagesUrl[layer.name];
                    let cssStyle = {
                        height: '2.5em',
                    };
                    if (backgroundUrl) {
                        cssStyle = {
                            backgroundSize: '100%',
                            backgroundImage: 'url(' + backgroundUrl + ')',
                            ...cssStyle
                        }
                    }

                    ctxMenuLayout.push({
                        selected: layer.name === layerChosenName,
                        label: '<div style="background-color: rgba(0, 0, 0, 0.6); padding: 3px; border-radius: 3px">' + layer.name + '</div>',
                        cssStyle: cssStyle,
                        action
                    })
                }

                ctxMenu.attach(ctxMenuLayout);
                ctxMenu.show({
                    e: e,
                    position: {
                        anchor: el,
                        direction: 'bottom',
                    },
                    cssStyle: {
                        width: '20em',
                        overflowY: 'scroll',
                        maxHeight: '500px',
                        color: 'white',
                        backgroundColor: 'black',
                        border: '1px solid white',
                    }
                })

                // add the special brightness enhanced hover effect
                let items = ctxMenu
                    .element()
                    .querySelectorAll('.aladin-context-menu-item')
                for (let item of items) {
                    item.classList.add('aladin-survey-item')
                }
            }
        });

        super(el)

        ALEvent.HIPS_LAYER_ADDED.listenedBy(aladin.aladinDiv, (e) => {
            const layer = e.detail.layer;
            if (layer.layer === layerName) {
                layerChosenName = layer.name;
                el.update({
                    content: layerChosenName,
                    tooltip: tooltipOpt,
                })
            }
        });
    }
}
