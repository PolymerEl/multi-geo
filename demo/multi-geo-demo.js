import { LitElement, html, css } from 'lit-element';

import '@vaadin/vaadin-tabs';
import 'api-viewer-element';
import { Router } from '@vaadin/router';


import './basic-demo.js';
import './chart-demo.js';

import {github, preignition, DemoRoot} from '@preignition/preignition-demo';


/**
 * This component combines all the examples to be displayed. See the basic/intermediate/advanced folders for the actual examples.
 */

class DemoGeo extends DemoRoot {

  constructor() {
    super();
    this.activeTab = location.pathname === '/' ? 'intro' : location.pathname.replace('/', '');
    this.tabs = ['intro', 'charts', 'container', 'helper', 'advanced'];
  }

  firstUpdated() {
    const router = new Router(this.shadowRoot.getElementById('outlet'));
    router.setRoutes([
      { path: '/', component: 'demo-readme' },
      { path: '/intro', component: 'demo-readme' },
      { path: '/basic', component: 'basic-demo' },
      { path: '/chart', component: 'chart-demo' },
      // { path: '/helper', component: 'helper-demo' },
      { path: '/container', component: 'container-demo' },
      // { path: '/advanced', component: 'advanced-demo' },
      {
        path: '(.*)',
        redirect: '/',
        action: () => {
          this.activeTab = 'intro';
        }
      }
    ]);
  }

  render() {
    return html `
      <div id="header">
        <span class="logo"><a href="https://preignition.org">${preignition}</a></span>
        <h1>Multi chart - ${this.capitalize(this.activeTab)} API and demos</h1>
        <a class="github" href="https://www.github.com/preignition/multi-chart" target="_blank">${github}</a>
      </div>

      <vaadin-tabs class="${this.smallScreen ? 'nav' : ''}" orientation="${this.smallScreen ? 'vertical' : 'horizontal'}" selected=${this.tabs.indexOf(this.activeTab)} theme="${this.smallScreen ? '' : 'centered'}">
        <vaadin-tab @click=${() => this.switchRoute('intro')}>Intro</vaadin-tab>
        <vaadin-tab @click=${() => this.switchRoute('basic')}>Basic</vaadin-tab>
        <vaadin-tab @click=${() => this.switchRoute('chart')}>Charts</vaadin-tab>
        <vaadin-tab @click=${() => this.switchRoute('container')}>Container</vaadin-tab>
      </vaadin-tabs>

      <div id="outlet">
      </div>
      <p class="footer">Made with love by <a target="_blank" href="https://preignition.org/">preignition</a>, with precious help of <a target="_blank" href="https://github.com/web-padawan/api-viewer-element">api-viewer-element</a> and <a target="_blank" href="https://github.com/runem/web-component-analyzer">web-component-analyzer</a></p>
    `;
  }

}

customElements.define('multi-geo-demo', DemoGeo);