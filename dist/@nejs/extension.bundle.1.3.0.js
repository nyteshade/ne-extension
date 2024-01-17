var nejsExtension=(()=>{var g=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var b=Object.getOwnPropertyNames;var w=Object.prototype.hasOwnProperty;var x=(o,t)=>{for(var e in t)g(o,e,{get:t[e],enumerable:!0})},v=(o,t,e,s)=>{if(t&&typeof t=="object"||typeof t=="function")for(let i of b(t))!w.call(o,i)&&i!==e&&g(o,i,{get:()=>t[i],enumerable:!(s=m(t,i))||s.enumerable});return o};var A=o=>v(g({},"__esModule",{value:!0}),o);var P={};x(P,{Errors:()=>O,Extension:()=>f,Patch:()=>u,PatchEntry:()=>p,PatchToggle:()=>d});var E=o=>/(\w+)]/.exec(Object.prototype.toString.call(o))[1],l=class extends Error{constructor(t,e){super(`${E(t)} disallows tampering with ${e}.`),Object.assign(this,{owner:t,key:e})}get[Symbol.toStringTag](){return this.constructor.name}};var $=o=>/(\w+)]/.exec(Object.prototype.toString.call(o))[1],h=class extends Error{constructor(t,e){super(`${$(t)} does not have a property named '${e}'.`),Object.assign(this,{owner:t,key:e})}get[Symbol.toStringTag](){return this.constructor.name}};var d=class{constructor(t,e=!1){this.started=!1,this.preventRevert=e,this.patch=t,this.patchName=t.owner?.name??t.owner?.constructor?.name??/(\w+)]/.exec(Object.prototype.toString.call(t.owner))[1],this.state={needsApplication:!1,needsReversion:!1}}start(){return this.started||(this.state.needsApplication=!this.patch.applied,this.state.needsReversion=this.patch.applied,this.started=!0,this.state.needsApplication&&this.patch.apply()),this}stop(){return this.started&&((this.preventRevert||this.patch.applied)&&this.patch.revert(),this.state.needsApplication=!1,this.state.needsReversion=!1,this.started=!1),this}get[Symbol.toStringTag](){return`${this.constructor.name}:${this.patchName}`}[Symbol.for("nodejs.util.inspect.custom")](t,e,s){let i=this[Symbol.toStringTag],r=`(started: ${this.started} needed: ${this.state.needsApplication})`;return s(`${i} ${r}`,{...e,depth:t})}};var p=class{constructor(t,e=globalThis,s=void 0){let i=n=>n==null,r=(n,a=["string","symbol"])=>!i(n)&&!!a.find(y=>y===typeof n),c=n=>r(n,["object"]);if(!r(t))throw console.error("Property",t,`(type: ${typeof t})`,"owningObject",e,`(type: ${typeof e})`,"condition",s,`(type: ${typeof s})`),new TypeError("Property must be non-null and either a string or symbol");if(!c(e))throw new TypeError("Cannot create Patch entry as owning object is invalid");Object.assign(this,{key:t,descriptor:Object.getOwnPropertyDescriptor(e,t),owner:e,condition:typeof s=="function"?s:void 0})}get computed(){return this.isAccessor?this.descriptor.get.bind(this.owner).call():this.descriptor.value}get isData(){return Reflect.has(this.descriptor,"value")}get isAccessor(){return Reflect.has(this.descriptor,"get")}get isReadOnly(){return Reflect.has(this.descriptor,"configurable")&&!this.descriptor.configurable||Reflect.has(this.descriptor,"writable")&&!this.descriptor.writable}get isAllowed(){return this.condition&&typeof this.condition=="function"?this.condition():!0}get[Symbol.toStringTag](){return this.constructor.name}[Symbol.for("nodejs.util.inspect.custom")](t,e,s){let i=this.isData?" Data":" Accessor",r=this.isReadOnly?" [ReadOnly]":"";return`PatchEntry<${this.key}${i}${r}>`}};var u=class o{constructor(t,e,s={}){Object.assign(this,{owner:t,options:s}),this.patchConflicts={},this.patchEntries={},this.patchesOwner=e,this.patchCount=0,this.patchesApplied=0;let i=this?.options.condition;Reflect.ownKeys(e).forEach(r=>{let c=this?.options?.conditions?.[r]??i;try{this.patchEntries[r]=new p(r,this.patchesOwner,c),this.patchCount+=1}catch(n){console.error(`Failed to process patch for ${r}
`,n)}if(Reflect.has(this.owner,r))try{this.patchConflicts[r]=new p(r,this.owner)}catch(n){console.error(`Cannot capture conflicting patch key ${r}
`,n)}}),o.patches.has(t)||o.patches.set(t,[]),o.patches.get(t).push(this)}get entries(){return Reflect.ownKeys(this.patchEntries).map(t=>[t,this.patchEntries[t]])}get patches(){return this.entries.reduce((t,[e,s])=>(t[e]=s.computed,t),{})}get conflicts(){return Reflect.ownKeys(this.patchConflicts).map(t=>[t,this.patchConflicts[t]])}get applied(){return this.patchesApplied>0}get isPartiallyPatched(){return this.applied}get isFullyPatched(){return this.patchCount==this.patchesApplied}apply(t){let e=this.entries,s={patches:e.length,applied:0,errors:[],notApplied:e.length};e.forEach(([,i])=>{if(i.isAllowed){Object.defineProperty(this.owner,i.key,i.descriptor);let r=Object.getOwnPropertyDescriptor(this.owner,i.key);this.#t(r,i.descriptor)?(s.applied+=1,s.notApplied-=1):s.errors.push([i,new Error(`Could not apply patch for key ${i.key}`)])}}),this.patchesApplied=s.applied,typeof t=="function"&&t(s)}createToggle(t=!1){return new d(this,t)}revert(t){if(!this.applied)return;let e=this.entries,s=this.conflicts,i={patches:e.length,reverted:0,restored:0,conflicts:s.length,errors:[],stillApplied:0};e.forEach(([,r])=>{delete this.owner[r.key]?(this.patchesApplied-=1,i.reverted+=1):i.errors.push([r,new Error(`Failed to revert patch ${r.key}`)])}),s.forEach(([,r])=>{Object.defineProperty(this.owner,r.key,r.descriptor);let c=Object.getOwnPropertyDescriptor(this.owner,r.key);this.#t(r.descriptor,c)?i.restored+=1:i.errors.push([r,new Error(`Failed to restore original ${r.key}`)])}),i.stillApplied=this.patchesApplied,typeof t=="function"&&t(i)}release(){let t=o.patches.get(this.owner);t.splice(t.find(e=>e===this),1)}owner=null;options=null;#t(t,e){if(!t||!e)return!1;let s=!0;return s=s&&t.configurable===e.configurable,s=s&&t.enumerable===e.enumerable,s=s&&t.value===e.value,s=s&&t.writable===e.writable,s=s&&t.get===e.get,s=s&&t.set===e.set,s}static patches=new Map;static enableFor(t){if(o.patches.has(t))for(let e of o.patches.get(t))e.apply()}static disableFor(t){if(o.patches.has(t))for(let e of o.patches.get(t))e.revert()}};var f=class o extends u{constructor(t,e,s=globalThis,i={}){let{key:r,extension:c,valid:n}=o.determineInput(t);if(c=e||c,!n)throw new h(s,r);let a=Object.getOwnPropertyDescriptor(s,r);if(a&&(Reflect.has(a,"writable")&&!a.writable||Reflect.has(a,"configurable")&&!a.configurable))throw new l(s,r);super(s,{[r]:c},i),this.key=r}static determineInput(t){let e={key:null,extension:null,valid:!1};return t instanceof Function?e={key:t.name,extension:t,valid:!0}:(typeof t=="string"||t instanceof String)&&(e={key:t,extension:null,valid:!0}),e}[Symbol.for("nodejs.util.inspect.custom")](t,e,s){return`Extension<${this.key}>`}get[Symbol.toStringTag](){return this.constructor.name}};var O={get CannotBeExtended(){return l},get MissingOwnerValue(){return h}};return A(P);})();
//# sourceMappingURL=extension.bundle.1.3.0.js.map