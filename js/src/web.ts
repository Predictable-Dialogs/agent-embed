// web.ts
import { registerWebComponents } from './register';
import { parsePredictable, injectAgentInWindow } from './window';

let agent;

if (typeof window !== 'undefined') {
  registerWebComponents();
  agent = parsePredictable();
  injectAgentInWindow(agent);
}

export default agent;
