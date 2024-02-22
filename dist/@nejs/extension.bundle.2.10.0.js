var nejsExtension=(()=>{var m=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var w=Object.getOwnPropertyNames;var x=Object.prototype.hasOwnProperty;var O=(n,t)=>{for(var e in t)m(n,e,{get:t[e],enumerable:!0})},$=(n,t,e,r)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of w(t))!x.call(n,s)&&s!==e&&m(n,s,{get:()=>t[s],enumerable:!(r=S(t,s))||r.enumerable});return n};var P=n=>$(m({},"__esModule",{value:!0}),n);var T={};O(T,{Errors:()=>A,Extension:()=>y,Patch:()=>u,PatchEntry:()=>h,PatchToggle:()=>g});var v=n=>/(\w+)]/.exec(Object.prototype.toString.call(n))[1],f=class extends Error{constructor(t,e){super(`${v(t)} disallows tampering with ${e}.`),Object.assign(this,{owner:t,key:e})}get[Symbol.toStringTag](){return this.constructor.name}};var E=n=>/(\w+)]/.exec(Object.prototype.toString.call(n))[1],d=class extends Error{constructor(t,e){super(`${E(t)} does not have a property named '${e}'.`),Object.assign(this,{owner:t,key:e})}get[Symbol.toStringTag](){return this.constructor.name}};var g=class{constructor(t,e=!1){this.started=!1,this.preventRevert=e,this.patch=t,this.patchName=t.owner?.name??t.owner?.constructor?.name??/(\w+)]/.exec(Object.prototype.toString.call(t.owner))[1],this.state={needsApplication:!1,needsReversion:!1}}start(){return this.started||(this.state.needsApplication=!this.patch.applied,this.state.needsReversion=this.patch.applied,this.started=!0,this.state.needsApplication&&this.patch.apply()),this}stop(){return this.started&&((this.preventRevert||this.patch.applied)&&this.patch.revert(),this.state.needsApplication=!1,this.state.needsReversion=!1,this.started=!1),this}get[Symbol.toStringTag](){return`${this.constructor.name}:${this.patchName}`}[Symbol.for("nodejs.util.inspect.custom")](t,e,r){let s=this[Symbol.toStringTag],i=`(started: ${this.started} needed: ${this.state.needsApplication})`;return r(`${s} ${i}`,{...e,depth:t})}};var h=class{constructor(t,e=globalThis,r=void 0,s={}){let i=c=>c==null,o=(c,p=["string","symbol"])=>!i(c)&&!!p.find(b=>b===typeof c),a=c=>o(c,["object"]);if(!o(t))throw console.error("Property",t,`(type: ${typeof t})`,"owningObject",e,`(type: ${typeof e})`,"condition",r,`(type: ${typeof r})`),new TypeError("Property must be non-null and either a string or symbol");if(!a(e))throw new TypeError("Cannot create Patch entry as owning object is invalid");let l={...Object.getOwnPropertyDescriptor(e,t),...Object(s)};Object.assign(this,{key:t,descriptor:l,owner:e,condition:typeof r=="function"?r:void 0})}get computed(){return this.isAccessor?this.descriptor.get.bind(this.owner).call():this.descriptor.value}get isData(){return Reflect.has(this.descriptor,"value")}get isAccessor(){return Reflect.has(this.descriptor,"get")}get isReadOnly(){return Reflect.has(this.descriptor,"configurable")&&!this.descriptor.configurable||Reflect.has(this.descriptor,"writable")&&!this.descriptor.writable}get isAllowed(){return this.condition&&typeof this.condition=="function"?this.condition():!0}applyTo(t,e=!1){let r={...this.descriptor};e&&(typeof r.get=="function"&&(r.get=r.get.bind(this.owner)),typeof r.set=="function"&&(r.set=r.set.bind(this.owner))),Object.defineProperty(t,this.key,r)}get[Symbol.toStringTag](){return this.constructor.name}[Symbol.for("nodejs.util.inspect.custom")](t,e,r){let s=`\x1B[33m${this.key}\x1B[39m`,i=this.isData?" Data":" Accessor",o=this.isReadOnly?" [\x1B[2;3mReadOnly\x1B[22;23m]":"";return`PatchEntry<${s}${i}${o}>`}};var u=class n{patchConflicts=Object.create(null);patchEntries=Object.create(null);patchesOwner=void 0;patchCount=0;patchesApplied=0;ownerDisplayName=void 0;constructor(t,e,r=Object.create(null)){Object.assign(this,{owner:t,options:r}),this.ownerDisplayName=r?.displayName??n.extractName(t),this.patchesOwner=n.constructWithStore(e,this),this.generatePatchEntries(this.patchesOwner),n.patches.has(t)||n.patches.set(t,[]),n.patches.get(t).push(this)}generatePatchEntries(t,e=void 0){let r=this?.options.condition;Reflect.ownKeys(t).forEach(s=>{let i=this?.options?.conditions?.[s]??r;try{let o=e??n.getDescriptorOverridesFromSymbol(s),a=t;if(n.isKnownPatchSymbol(s)){a=n.constructWithStore(t[s],this,s),t[s]=a,this.generatePatchEntries(a,o);return}this.patchEntries[s]=new h(s,t,i,e),this.patchCount+=1}catch(o){console.error(`Failed to process patch for ${String(s)}
`,o)}if(Reflect.has(this.owner,s))try{this.patchConflicts[s]=new h(s,this.owner)}catch(o){console.error(`Cannot capture conflicting patch key ${s}
`,o)}})}get entries(){return Reflect.ownKeys(this.patchEntries).map(t=>[t,this.patchEntries[t]])}get appliedEntries(){return Reflect.ownKeys(this.patchEntries).filter(t=>this.patchState.get(t)===!0).map(t=>[t,this.patchEntries[t]])}get unappliedEntries(){return Reflect.ownKeys(this.patchEntries).filter(t=>this.patchState.get(t)===!1).map(t=>[t,this.patchEntries[t]])}get patches(){return this.entries.reduce((t,[e,r])=>(t[e]=r.computed,t),Object.create(null))}get appliedPatches(){return this.entries.reduce((t,[e,r])=>(this.patchState.get(e)===!0&&(t[e]=r.computed),t),Object.create(null))}get unappliedPatches(){return this.entries.reduce((t,[e,r])=>(this.patchState.get(e)===!1&&(t[e]=r.computed),t),Object.create(null))}get patchKeys(){return this.entries.map(([t,e])=>t)}get prettyEntries(){let t=this.entries.map(([e,r])=>n.stringRef(n.extractName(e),e,r));return Object.defineProperty(t,"asEntries",{get(){return this.map(e=>e.entry)},enumerable:!1,configurable:!0}),t}get conflicts(){return Reflect.ownKeys(this.patchConflicts).map(t=>[t,this.patchConflicts[t]])}get applied(){return this.patchesApplied>0}get isPartiallyPatched(){return this.applied}get isFullyPatched(){return this.patchCount==this.patchesApplied}apply(t){let e=this.entries,r={patches:e.length,applied:0,errors:[],notApplied:e.length};this.patchState.clear(),e.forEach(([,s])=>{if(s.isAllowed){Object.defineProperty(this.owner,s.key,s.descriptor);let i=Object.getOwnPropertyDescriptor(this.owner,s.key);this.#e(i,s.descriptor)?(r.applied+=1,r.notApplied-=1,this.patchState.set(s,!0)):(r.errors.push([s,new Error(`Could not apply patch for key ${s.key}`)]),this.patchState.set(s,!1))}else this.patchState.set(s,!1)}),this.patchesApplied=r.applied,typeof t=="function"&&t(r)}createToggle(t=!1){return new g(this,t)}revert(t){if(!this.applied)return;let e=this.entries,r=this.conflicts,s={patches:e.length,reverted:0,restored:0,conflicts:r.length,errors:[],stillApplied:0};e.forEach(([,i])=>{delete this.owner[i.key]?(this.patchesApplied-=1,s.reverted+=1,this.patchState.set(i,!1)):s.errors.push([i,new Error(`Failed to revert patch ${i.key}`)])}),r.forEach(([,i])=>{Object.defineProperty(this.owner,i.key,i.descriptor);let o=Object.getOwnPropertyDescriptor(this.owner,i.key);this.#e(i.descriptor,o)?s.restored+=1:s.errors.push([i,new Error(`Failed to restore original ${i.key}`)])}),s.stillApplied=this.patchesApplied,typeof t=="function"&&t(s)}release(){let t=n.patches.get(this.owner);t.splice(t.find(e=>e===this),1)}owner=null;options=null;patchState=new Map;[Symbol.iterator](){return this.entries.values()}#e(t,e){return!t||!e?!1:t.configurable===e.configurable&&t.enumerable===e.enumerable&&t.value===e.value&&t.writable===e.writable&&t.get===e.get&&t.set===e.set}[Symbol.for("nodejs.util.inspect.custom")](t,e,r){let s={get quotes(){return/^(\x1B\[\d+m)?['"]|["'](\x1B\[\d+m)?$/g},get arrays(){return/^(\x1B\[\d+m)?\[ | \](\x1B\[\d+m)?$/g}},i={...e,depth:t},o=this.ownerDisplayName??"",a=o.length?`[${r(o,e).replaceAll(s.quotes,"$1$2")}]`:"",l=r(this.patchKeys,i).replaceAll(s.arrays,"$1$2").replaceAll(/'(.*?)'/g,"$1");return`${this.constructor.name}${a} { ${l} }`}static patches=new Map;static enableFor(t){if(n.patches.has(t))for(let e of n.patches.get(t))e.apply()}static enableProbableStatics(){for(let t of n.patches.keys())typeof t=="function"&&n.enableFor(t)}static enableProbableInstances(){for(let t of n.patches.keys())typeof t!="function"&&n.enableFor(t)}static enableAll(){for(let t of n.patches.keys())n.enableFor(t)}static disableFor(t){if(n.patches.has(t))for(let e of n.patches.get(t))e.revert()}static disableAll(){for(let t of n.patches.keys())n.disableFor(t)}static disableProbableStatics(){for(let t of n.patches.keys())typeof t=="function"&&n.disableFor(t)}static disableProbableInstances(){for(let t of n.patches.keys())typeof t!="function"&&n.disableFor(t)}static get applied(){return this.#t(globalThis,!0)}static get known(){return this.#t(globalThis,!1)}static get use(){return this.#t(globalThis,!1,!0)}static get lazy(){return this.#t(globalThis,!1,!1,!0)}static scopedTo(t){let e=(r,s,i=!1,o=!1)=>this.#t(r,s,i,o);return{get applied(){return e(t,!0,!1)},get known(){return e(t,!1,!1)},get use(){return e(t,!1,!0)},get lazy(){return e(t,!1,!1,!0)}}}static#t(t,e,r=!1,s=!1){return[...n.patches.values()].flat().filter(i=>i.owner===t).reduce((i,o)=>{for(let[,a]of o.entries)if(!(e&&o.patchState.get(a)!==!0)){if(r){i[a.key]=async l=>{if(typeof l!="function")return;let c=Object.prototype.toString.call(l),p=o.createToggle();p.start(),c==="[object AsyncFunction]"?await l(a.computed,a):l(a.computed,a),p.stop()};continue}if(s){Object.defineProperty(i,a.key,{get(){return o.apply(),a.computed},enumerable:!0,configurable:!0});continue}if(a.isAccessor){let l=`applyAccessorFor_${String(a.key)}`,c={[l](p){return a.applyTo(p),p}};i[a.key]=c[l]}else a.applyTo(i)}return i},Object.create(null))}static get CustomInspect(){return Symbol.for("nodejs.util.inspect.custom")}static stripExtras(t){return t.replaceAll(/^(\x1B\[\d+m)?[\[\{]\s?|\s?[\]\}](\x1B\[\d+m)?$/gm,"$1$2").replaceAll(/['"](.*?)['"]/gm,"$1")}static get kMutablyHidden(){return Symbol.for('{"enumerable":false,"configurable":true}')}static mutablyHidden(t,e=Object.create(null)){return this.customDescriptorPatch(t,this.kMutablyHidden,e)}static get kMutablyVisible(){return Symbol.for('{"enumerable":true,"configurable":true}')}static mutablyVisible(t,e=Object.create(null)){return this.customDescriptorPatch(t,this.kMutablyVisible,e)}static get kImmutablyHidden(){return Symbol.for('{"enumerable":false,"configurable":false}')}static immutablyHidden(t,e=Object.create(null)){return this.customDescriptorPatch(t,this.kImmutablyHidden,e)}static get kImmutablyVisible(){return Symbol.for('{"enumerable":true,"configurable":false}')}static immutablyVisible(t,e=Object.create(null)){return this.customDescriptorPatch(t,this.kImmutablyVisible,e)}static customDescriptorPatch(t,e,r=Object.create(null)){return!this.stores.has(t)&&(this.stores.set(t,r),n.isKnownPatchSymbol(e))?(r[e]=Object.create(null),this.stores.get(t)[e]):this.stores.get(t)}static isKnownPatchSymbol(t){return typeof t=="symbol"?[this.kImmutablyHidden,this.kImmutablyVisible,this.kMutablyHidden,this.kMutablyVisible].some(e=>e===t):!1}static constructWithStore(t,e,r,s=Object.create(null)){if(typeof t!="function")return t;try{let i=n.customDescriptorPatch(e,r,s);return t(i)}catch(i){return console.error(i),t}}static getDescriptorOverridesFromSymbol(t){let e=Object.create(null);return this.isKnownPatchSymbol(t)&&(e=JSON.parse(t.description)),e}static stores=new WeakMap;static stringRef(t,e,r){return Object.assign(Object(t),{get key(){return e},get value(){return r},get entry(){return[e,r]},get entries(){return[this.entry]},valueOf(){return String(this)},[Symbol.toStringTag]:"String",[Symbol.for("nodejs.util.inspect.custom")](i,o,a){return a(String(this),{colors:!0})}})}static shareOwnPropertyNames(t,e){let r=s=>Object.getOwnPropertyNames(Object(s));return r(t).every(s=>r(e??t?.constructor?.prototype).some(i=>i==s))}static extractName(t,e){let r=(o,a)=>o.some(l=>l===a),s;r([Symbol.prototype,Date.prototype,BigInt.prototype],t)||(s=t?.valueOf?.());let i=s&&(s instanceof String||typeof s=="string")?String(s):void 0;return((typeof t=="symbol"?String(t):void 0)??(typeof t=="string"?t:void 0)??(t instanceof String?String(t):void 0))||(t===Function.prototype||typeof t!="function")&&typeof t!="symbol"&&n.shareOwnPropertyNames(t)&&t?.constructor?.name&&`${t.constructor.name}.prototype`||(t?.[Symbol.toStringTag]??t?.name??i??(typeof e=="function"?e(t):void 0)??(typeof e=="string"?e:void 0)??Object.entries({Reflect}).find(([o,a])=>a===t)?.[0]??`Unknown.${Math.random().toString(36).slice(2)}`)}};var j=["number","boolean","bigint","string","symbol"],y=class n extends u{constructor(t,e,r=globalThis,s={}){let i=n.determineInput(t),{key:o,extension:a,valid:l}=i;if(a=e||a,!l)throw new d(r,o);let c=Object.getOwnPropertyDescriptor(r,o);if(c&&(Reflect.has(c,"writable")&&!c.writable||Reflect.has(c,"configurable")&&!c.configurable))throw new f(r,o);super(r,{[o]:a},s),this.key=o,this.class=i.class,this.function=i.function}get isFunction(){return!!this.function}get isClass(){return!!this.class}get isPrimitive(){return~j.indexOf(typeof this.value)}get isObject(){return Object(this.value)===this.value}static get applied(){return u.applied}static get known(){return u.known}static get use(){return u.use}static get lazy(){return u.lazy}static scopedTo(t){return u.scopedTo(t)}static determineInput(t){let e={key:null,extension:null,valid:!1};return t instanceof Function?(e={key:t.name,extension:t,valid:!0},/^class .*/.exec(t.toString())&&(e.class=t),/^(async )?function .*/.exec(t.toString())&&(e.function=t)):(typeof t=="string"||t instanceof String)&&(e={key:t,extension:null,valid:!0}),e}[Symbol.for("nodejs.util.inspect.custom")](t,e,r){let s={get braces(){return/^(\x1B\[\d+m)?[\[\{]|[\]\}](\x1B\[\d+m)?$/g},get quotes(){return/^(\x1B\[\d+m)?['"]|["'](\x1B\[\d+m)?$/g}},i=r(this.key,e).replaceAll(s.quotes,"$1$2"),o=r(this.patches[this.key],e).replaceAll(s.braces,"$1$2");return`Extension[${i}:${o}]`}get[Symbol.toStringTag](){return this.constructor.name}static createSet(t,...e){return new n.ExtensionSet(t,...e)}static ExtensionSet=class{constructor(e,...r){this.name=e,this.extensionObjects=new Set,this.extensions=new Set;for(let s of r)s instanceof n?(this.extensions.add(s),this.extensionObjects.add(s.patches[s.key])):s instanceof Function&&(this.extensionObjects.add(s),this.extensions.add(new n(s)))}apply(){for(let e of this.extensions)e.apply()}revert(){for(let e of this.extensions)e.revert()}}};var A={get CannotBeExtended(){return f},get MissingOwnerValue(){return d}};return P(T);})();
//# sourceMappingURL=extension.bundle.2.10.0.js.map
