import './style.css'
import { setupFeatureBrowser } from './featureBrowser'
import { io } from 'socket.io-client';

// window type def for getFeatures and putFeature
declare global {
  interface Window {
    getFeatures: () => void;
    putFeature: (name: string, description: string) => void;
  }
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Gherkin Feature Test Manager</h1>
    <div class="card flex-row flex space-between">
      <button type="button" class="button button-primary">Reset</button>
      <button type="button" class="button button-primary">Import</button>
      <button type="button" class="button button-primary">Export</button>
    </div>
    <div id="featureBrowser"></div>
    <div id="your-tree-element-id"></div>
  </div>
`

setupFeatureBrowser(document.querySelector<HTMLDivElement>('#featureBrowser')!)

// Connect to Socket.IO server
const socket = io('http://127.0.0.1:3009');

console.warn('hello');

function getFeatures(){
  socket.emit('message', JSON.stringify({
      type:'get',
      target:'features'
  }));
}
window.getFeatures = getFeatures;
function putFeature(name: string, description: string){
  socket.emit('message', JSON.stringify({
    type:'put',
    target:'features',
    name,
    description
  }));
}
window.putFeature = putFeature;
// Send a message once connected
socket.on('connect', () => {
    console.log('Connected to Socket.IO server');
    socket.emit('message', 'Hello from Client!');

    getFeatures();
    putFeature('my first test feature '+Date.now(), 'this is a test feature');
});
socket.on('message', (message: string) => {
    console.log('server says:',message);
});
