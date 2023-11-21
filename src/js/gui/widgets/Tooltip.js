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


import { DOMElement } from './Widget.js';


/* Add a tooltip on a already added Element on the DOM */
export class Tooltip extends DOMElement {
    constructor(options, target) {
        // Creation of the DOM element
        let el = document.createElement('span');
        el.classList.add('aladin-tooltip');

        let targetParent = target.parentNode;

        // Insert it into the DOM tree
        let wrapperEl = document.createElement('div');
        wrapperEl.classList.add('aladin-tooltip-container');

        if (targetParent) {
            let targetIndex = Array.prototype.indexOf.call(targetParent.children, target);
            targetParent.removeChild(target);

            wrapperEl.appendChild(target);
            wrapperEl.appendChild(el);

            targetParent.insertChildAtIndex(wrapperEl, targetIndex);
        } else {
            wrapperEl.appendChild(target);
            wrapperEl.appendChild(el);
        }

        // Set the anchor to the element on which
        // the tooltip is set
        if (options.position) {
            options.position.anchor = target;
        }

        super(wrapperEl, options)

        this._show();
    }

    setPosition(options) {
        let left = 0, top = 0, x = 0, y = 0;

        // take on less priority the left and top
        if (options && options.left) {
            left = options.left;
        }

        if (options && options.top) {
            top = options.top;
        }

        // handle the anchor/dir case with higher priority
        if (options && options.direction) {
            let dir = options.direction || 'right';
            this.removeClass('left');
            this.removeClass('right');
            this.removeClass('bottom');
            this.removeClass('top');

            switch (dir) {
                case 'left':
                    this.addClass('left');
                    break;
                case 'right':
                    this.addClass('right');
                    break;
                case 'top':
                    this.addClass('top');
                    break;
                case 'bottom':
                    this.addClass('bottom');
                    break;
                default:
                    break;
            }
        }
    }

    _show() {
        let tooltipEl = this.el.querySelector('.aladin-tooltip');
        tooltipEl.innerHTML = '';

        if (this.options.content) {
            let content = this.options.content;
            if (content instanceof DOMElement) {
                content.attachTo(tooltipEl)
            } else if (content instanceof Element) {                
                tooltipEl.insertAdjacentElement('beforeend', content);
            } else {
                let wrapEl = document.createElement('div');
                wrapEl.innerHTML = content;
                tooltipEl.insertAdjacentElement('beforeend', wrapEl);
            }
        }

        super._show();

        if (this.options.position) {
            this.setPosition(this.options.position)
        }
    }

    element() {
        return this.el.querySelector('.aladin-tooltip');
    }
    
    static add(options, target) {
        if (target) {
            if (target.tooltip) {
                target.tooltip.update(options)
            } else {
                target.tooltip = new Tooltip(options, target.element())
            }
        }
    }
}