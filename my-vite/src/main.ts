import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="flex flex-row w-full">
    <div class="w-1/2 pr-4">
      <p>we are so back</p>
      <div id="counter" class="button border-2 border-purple-500 rounded-lg" style="cursor:pointer;"></div>
    </div>
    <div class="w-1/2 pl-4">
      <p>it is so over</p>
      <div id="counter2" class="button border-2 border-red-500 rounded-lg" style="cursor:pointer;"></div>
    </div>
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
setupCounter(document.querySelector<HTMLButtonElement>('#counter2')!)
