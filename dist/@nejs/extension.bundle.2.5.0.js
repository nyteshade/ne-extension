var nejsExtension=(()=>{var m=Object.defineProperty;var y=Object.getOwnPropertyDescriptor;var b=Object.getOwnPropertyNames;var w=Object.prototype.hasOwnProperty;var x=(n,t)=>{for(var e in t)m(n,e,{get:t[e],enumerable:!0})},$=(n,t,e,r)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of b(t))!w.call(n,s)&&s!==e&&m(n,s,{get:()=>t[s],enumerable:!(r=y(t,s))||r.enumerable});return n};var S=n=>$(m({},"__esModule",{value:!0}),n);var O={};x(O,{Errors:()=>j,Extension:()=>g,Patch:()=>d,PatchEntry:()=>p,PatchToggle:()=>f});var v=n=>/(\w+)]/.exec(Object.prototype.toString.call(n))[1],h=class extends Error{constructor(t,e){super(`${v(t)} disallows tampering with ${e}.`),Object.assign(this,{owner:t,key:e})}get[Symbol.toStringTag](){return this.constructor.name}};var E=n=>/(\w+)]/.exec(Object.prototype.toString.call(n))[1],u=class extends Error{constructor(t,e){super(`${E(t)} does not have a property named '${e}'.`),Object.assign(this,{owner:t,key:e})}get[Symbol.toStringTag](){return this.constructor.name}};var f=class{constructor(t,e=!1){this.started=!1,this.preventRevert=e,this.patch=t,this.patchName=t.owner?.name??t.owner?.constructor?.name??/(\w+)]/.exec(Object.prototype.toString.call(t.owner))[1],this.state={needsApplication:!1,needsReversion:!1}}start(){return this.started||(this.state.needsApplication=!this.patch.applied,this.state.needsReversion=this.patch.applied,this.started=!0,this.state.needsApplication&&this.patch.apply()),this}stop(){return this.started&&((this.preventRevert||this.patch.applied)&&this.patch.revert(),this.state.needsApplication=!1,this.state.needsReversion=!1,this.started=!1),this}get[Symbol.toStringTag](){return`${this.constructor.name}:${this.patchName}`}[Symbol.for("nodejs.util.inspect.custom")](t,e,r){let s=this[Symbol.toStringTag],i=`(started: ${this.started} needed: ${this.state.needsApplication})`;return r(`${s} ${i}`,{...e,depth:t})}};var p=class{constructor(t,e=globalThis,r=void 0){let s=c=>c==null,i=(c,l=["string","symbol"])=>!s(c)&&!!l.find(a=>a===typeof c),o=c=>i(c,["object"]);if(!i(t))throw console.error("Property",t,`(type: ${typeof t})`,"owningObject",e,`(type: ${typeof e})`,"condition",r,`(type: ${typeof r})`),new TypeError("Property must be non-null and either a string or symbol");if(!o(e))throw new TypeError("Cannot create Patch entry as owning object is invalid");Object.assign(this,{key:t,descriptor:Object.getOwnPropertyDescriptor(e,t),owner:e,condition:typeof r=="function"?r:void 0})}get computed(){return this.isAccessor?this.descriptor.get.bind(this.owner).call():this.descriptor.value}get isData(){return Reflect.has(this.descriptor,"value")}get isAccessor(){return Reflect.has(this.descriptor,"get")}get isReadOnly(){return Reflect.has(this.descriptor,"configurable")&&!this.descriptor.configurable||Reflect.has(this.descriptor,"writable")&&!this.descriptor.writable}get isAllowed(){return this.condition&&typeof this.condition=="function"?this.condition():!0}applyTo(t,e=!1){let r={...this.descriptor};e&&(typeof r.get=="function"&&(r.get=r.get.bind(this.owner)),typeof r.set=="function"&&(r.set=r.set.bind(this.owner))),Object.defineProperty(t,this.key,r)}get[Symbol.toStringTag](){return this.constructor.name}[Symbol.for("nodejs.util.inspect.custom")](t,e,r){let s=this.isData?" Data":" Accessor",i=this.isReadOnly?" [ReadOnly]":"";return`PatchEntry<${this.key}${s}${i}>`}};var d=class n{patchConflicts={};patchEntries={};patchesOwner=void 0;patchCount=0;patchesApplied=0;constructor(t,e,r={}){Object.assign(this,{owner:t,options:r}),this.patchesOwner=e;let s=this?.options.condition;Reflect.ownKeys(e).forEach(i=>{let o=this?.options?.conditions?.[i]??s;try{this.patchEntries[i]=new p(i,this.patchesOwner,o),this.patchCount+=1}catch(c){console.error(`Failed to process patch for ${i}
`,c)}if(Reflect.has(this.owner,i))try{this.patchConflicts[i]=new p(i,this.owner)}catch(c){console.error(`Cannot capture conflicting patch key ${i}
`,c)}}),n.patches.has(t)||n.patches.set(t,[]),n.patches.get(t).push(this)}get entries(){return Reflect.ownKeys(this.patchEntries).map(t=>[t,this.patchEntries[t]])}get appliedEntries(){return Reflect.ownKeys(this.patchEntries).filter(t=>this.patchState.get(t)===!0).map(t=>[t,this.patchEntries[t]])}get unappliedEntries(){return Reflect.ownKeys(this.patchEntries).filter(t=>this.patchState.get(t)===!1).map(t=>[t,this.patchEntries[t]])}get patches(){return this.entries.reduce((t,[e,r])=>(t[e]=r.computed,t),{})}get appliedPatches(){return this.entries.reduce((t,[e,r])=>(this.patchState.get(e)===!0&&(t[e]=r.computed),t),{})}get unappliedPatches(){return this.entries.reduce((t,[e,r])=>(this.patchState.get(e)===!1&&(t[e]=r.computed),t),{})}get patchKeys(){return this.entries.map(([t,e])=>t)}get conflicts(){return Reflect.ownKeys(this.patchConflicts).map(t=>[t,this.patchConflicts[t]])}get applied(){return this.patchesApplied>0}get isPartiallyPatched(){return this.applied}get isFullyPatched(){return this.patchCount==this.patchesApplied}apply(t){let e=this.entries,r={patches:e.length,applied:0,errors:[],notApplied:e.length};this.patchState.clear(),e.forEach(([,s])=>{if(s.isAllowed){Object.defineProperty(this.owner,s.key,s.descriptor);let i=Object.getOwnPropertyDescriptor(this.owner,s.key);this.#e(i,s.descriptor)?(r.applied+=1,r.notApplied-=1,this.patchState.set(s,!0)):(r.errors.push([s,new Error(`Could not apply patch for key ${s.key}`)]),this.patchState.set(s,!1))}else this.patchState.set(s,!1)}),this.patchesApplied=r.applied,typeof t=="function"&&t(r)}createToggle(t=!1){return new f(this,t)}revert(t){if(!this.applied)return;let e=this.entries,r=this.conflicts,s={patches:e.length,reverted:0,restored:0,conflicts:r.length,errors:[],stillApplied:0};e.forEach(([,i])=>{delete this.owner[i.key]?(this.patchesApplied-=1,s.reverted+=1):s.errors.push([i,new Error(`Failed to revert patch ${i.key}`)])}),r.forEach(([,i])=>{Object.defineProperty(this.owner,i.key,i.descriptor);let o=Object.getOwnPropertyDescriptor(this.owner,i.key);this.#e(i.descriptor,o)?s.restored+=1:s.errors.push([i,new Error(`Failed to restore original ${i.key}`)])}),s.stillApplied=this.patchesApplied,typeof t=="function"&&t(s)}release(){let t=n.patches.get(this.owner);t.splice(t.find(e=>e===this),1)}owner=null;options=null;patchState=new Map;[Symbol.iterator](){return this.entries.values()}#e(t,e){return!t||!e?!1:t.configurable===e.configurable&&t.enumerable===e.enumerable&&t.value===e.value&&t.writable===e.writable&&t.get===e.get&&t.set===e.set}[Symbol.for("nodejs.util.inspect.custom")](t,e,r){let s={get quotes(){return/^(\x1B\[\d+m)?['"]|["'](\x1B\[\d+m)?$/g},get arrays(){return/^(\x1B\[\d+m)?\[ | \](\x1B\[\d+m)?$/g}},i={...e,depth:t},o=this.owner?.name??"",c=o.length?`[${r(o,e).replaceAll(s.quotes,"$1$2")}]`:"",l=r(this.patchKeys,i).replaceAll(s.arrays,"$1$2").replaceAll(/'(.*?)'/g,"$1");return`${this.constructor.name}${c} { ${l} }`}static patches=new Map;static enableFor(t){if(n.patches.has(t))for(let e of n.patches.get(t))e.apply()}static disableFor(t){if(n.patches.has(t))for(let e of n.patches.get(t))e.revert()}static get applied(){return this.#t(globalThis,!0)}static get known(){return this.#t(globalThis,!1)}static get use(){return this.#t(globalThis,!1,!0)}static scopedTo(t){let e=(r,s,i=!1)=>this.#t(r,s,i);return{get applied(){return e(t,!0,!1)},get known(){return e(t,!1,!1)},get use(){return e(t,!1,!0)}}}static#t(t,e,r=!1){return[...n.patches.values()].flat().filter(s=>s.owner===t).reduce((s,i)=>{for(let[,o]of i.entries)if(!(e&&i.patchState.get(o)!==!0)){if(r){s[o.key]=async c=>{if(typeof c!="function")return;let l=Object.prototype.toString.call(c),a=i.createToggle();a.start(),l==="[object AsyncFunction]"?await c(o.computed,o):c(o.computed,o),a.stop()};continue}if(o.isAccessor){let c=`applyAccessorFor_${String(o.key)}`,l={[c](a){return o.applyTo(a),a}};s[o.key]=l[c]}else o.applyTo(s)}return s},{})}static get CustomInspect(){return Symbol.for("nodejs.util.inspect.custom")}static stripExtras(t){return t.replaceAll(/^(\x1B\[\d+m)?[\[\{]\s?|\s?[\]\}](\x1B\[\d+m)?$/gm,"$1$2").replaceAll(/['"](.*?)['"]/gm,"$1")}};var A=["number","boolean","bigint","string","symbol"],g=class n extends d{constructor(t,e,r=globalThis,s={}){let i=n.determineInput(t),{key:o,extension:c,valid:l}=i;if(c=e||c,!l)throw new u(r,o);let a=Object.getOwnPropertyDescriptor(r,o);if(a&&(Reflect.has(a,"writable")&&!a.writable||Reflect.has(a,"configurable")&&!a.configurable))throw new h(r,o);super(r,{[o]:c},s),this.key=o,this.class=i.class,this.function=i.function}get isFunction(){return!!this.function}get isClass(){return!!this.class}get isPrimitive(){return~A.indexOf(typeof this.value)}get isObject(){return Object(this.value)===this.value}static determineInput(t){let e={key:null,extension:null,valid:!1};return t instanceof Function?(e={key:t.name,extension:t,valid:!0},/^class .*/.exec(t.toString())&&(e.class=t),/^(async )?function .*/.exec(t.toString())&&(e.function=t)):(typeof t=="string"||t instanceof String)&&(e={key:t,extension:null,valid:!0}),e}[Symbol.for("nodejs.util.inspect.custom")](t,e,r){let s={get braces(){return/^(\x1B\[\d+m)?[\[\{]|[\]\}](\x1B\[\d+m)?$/g},get quotes(){return/^(\x1B\[\d+m)?['"]|["'](\x1B\[\d+m)?$/g}},i=r(this.key,e).replaceAll(s.quotes,"$1$2"),o=r(this.patches[this.key],e).replaceAll(s.braces,"$1$2");return`Extension[${i}:${o}]`}get[Symbol.toStringTag](){return this.constructor.name}static createSet(t,...e){return new n.ExtensionSet(t,...e)}static ExtensionSet=class{constructor(e,...r){this.name=e,this.extensionObjects=new Set,this.extensions=new Set;for(let s of r)s instanceof n?(this.extensions.add(s),this.extensionObjects.add(s.patches[s.key])):s instanceof Function&&(this.extensionObjects.add(s),this.extensions.add(new n(s)))}apply(){for(let e of this.extensions)e.apply()}revert(){for(let e of this.extensions)e.revert()}}};var j={get CannotBeExtended(){return h},get MissingOwnerValue(){return u}};return S(O);})();
//# sourceMappingURL=extension.bundle.2.5.0.js.map
