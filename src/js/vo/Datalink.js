    // Copyright 2013 - UDS/CNRS
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




/******************************************************************************
 * Aladin Lite project
 * 
 * File Datalink
 * 
 * Author: Matthieu Baumann[CDS]
 * 
 *****************************************************************************/

import { VOTable } from "./VOTable.js";
import { Utils } from './../Utils';
import { ActionButton } from "../gui/widgets/ActionButton.js";

export let Datalink = (function() {

    let Datalink = function () {
        this.SODAServerParams = undefined;
        this.sodaQueryWindow = undefined;
    };

    Datalink.prototype.handleActions = function(obscoreRow, aladinInstance) {
        const url = obscoreRow["access_url"];
        VOTable.parse(
            url,
            (rsc) => {
                let table = VOTable.parseTableRsc(rsc);

                if (table && table.fields && table.rows) {
                    // Get the fields and the rows
                    let measures = [];
                    const { fields, rows } = table;
                    rows.forEach(row => {        
                        let data = {};

                        for (const [_, field] of Object.entries(fields)) {
                            var key = field.name;
                            data[key] = row[field.idx];
                        }

                        if (data['semantics'] === '#cutout') {
                            data['service_def'] = new ActionButton({
                                content: '📡',
                                backgroundColor: 'white',
                                borderColor: '#484848',
                                info: 'Open the cutout service form',
                                action(e) {}
                            }, aladinInstance.measurementTable.element).element();
                        }

                        measures.push({data: data})
                    })

                    let datalinkTable = {
                        'name': 'Datalink:' + url,
                        'color': 'purple',
                        'rows': measures,
                        'fields': fields,
                        'fieldsClickedActions': {
                            'service_def': (row) => {
                                const service = row['service_def'];

                                if (service) {
                                    aladinInstance.sodaQueryWindow.hide();
                                    aladinInstance.sodaQueryWindow.setParams(this.SODAServerParams);
                                    aladinInstance.sodaQueryWindow.show(aladinInstance);
                                }
                            },
                            'access_url': (row) => {
                                let url = row['access_url'];
                                console.log(url)
                                if (url === '--') {
                                    return;
                                }

                                let contentType = row['content_type'];
                                let contentQualifier = row['content_qualifier'];

                                let processImageFitsClick = () => {
                                    var successCallback = ((ra, dec, fov, _) => {
                                        aladinInstance.gotoRaDec(ra, dec);
                                        aladinInstance.setFoV(fov);
                                    });
                    
                                    let image = aladinInstance.createImageFITS(url, url, {}, successCallback);
                                    aladinInstance.setOverlayImageLayer(image, Utils.uuidv4())
                                };

                                switch (contentType) {
                                    case 'application/hips':
                                        // Clic on a HiPS
                                        let survey = aladinInstance.newImageSurvey(url);
                                        aladinInstance.setOverlayImageLayer(survey, Utils.uuidv4())
                                        break;
                                    // Any generic FITS file
                                    case 'application/fits':
                                        if (contentQualifier === "cube") {
                                            // fits cube
                                            console.warn("Cube not handled, only first slice downloaded")
                                        }

                                        processImageFitsClick();
                                        break;
                                    case 'image/fits':
                                        if (contentQualifier === "cube") {
                                            // fits cube
                                            console.warn("Cube not handled, only first slice downloaded")
                                        }

                                        processImageFitsClick();
                                        break;
                                    default:
                                        // When all has been done, download what's under the link
                                        Utils.download(url);
                                        break;
                                }
                            }
                        }
                    }

                    aladinInstance.measurementTable.showMeasurement([datalinkTable]);
                } else {
                    // Try to parse a SODA service descriptor resource
                    let SODAServerParams = VOTable.parseSODAServiceRsc(rsc);
                    if (SODAServerParams) {
                        this.SODAServerParams = SODAServerParams;

                        // Try to populate the SODA form fields with obscore values
                        let populateSODAFields = (SODAParams) => {
                            for (const name in SODAParams.inputParams) {
                                let inputParam = SODAParams.inputParams[name];

                                if (inputParam.type === "group") {
                                    for (const param of inputParam.subInputs) {
                                        if (param.value) {
                                            continue;
                                        }

                                        if (param.name === "ra") {
                                            param.value = obscoreRow['s_ra'];
                                        } else if (param.name === "dec") {
                                            param.value = obscoreRow['s_dec'];
                                        } else if (param.name === "fmin") {
                                            param.value = obscoreRow['em_min'];
                                        } else if (param.name === "fmax") {
                                            param.value = obscoreRow['em_max'];
                                        } else if (param.name === "rad") {
                                            param.value = obscoreRow['s_fov'] / 2;
                                        }
                                    }
                                }
                            }
                        };

                        // Request the base url of the SODA server to check if there
                        // is a self description VOTable
                        VOTable.parse(this.SODAServerParams.baseUrl, (rsc) => {
                            const SODAServerDesc = VOTable.parseSODAServiceRsc(rsc);

                            if (SODAServerDesc) {
                                console.log(rsc, "soda server", SODAServerDesc)

                                for (const name in SODAServerDesc.inputParams) {
                                    let inputParam = SODAServerDesc.inputParams[name];
                                    if (!this.SODAServerParams.inputParams[name]) {
                                        this.SODAServerParams.inputParams[name] = inputParam;
                                    }
                                }
                            }

                            populateSODAFields(this.SODAServerParams);
                        }, undefined, true);

                        populateSODAFields(this.SODAServerParams);
                    }
                }
            },
            undefined,
            true
        )
    };

    return Datalink;
})();
