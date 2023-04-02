/*import { createApp } from 'vue'
import Demo from './Demo/Demo.vue'

const app = createApp(Demo);

// enable devtools for the demo
app.config.devtools = true;

app.mount('#app');
*/

import { createApp, h } from 'vue'
import Demo from './Demo/Demo.vue'
import wrapper from "vue3-webcomponent-wrapper";

const CustomElement = wrapper(Demo, createApp, h);
window.customElements.define("vue-document-editor", CustomElement);
