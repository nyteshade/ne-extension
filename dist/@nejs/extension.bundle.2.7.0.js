var nejsExtension=(()=>{var m=Object.defineProperty;var b=Object.getOwnPropertyDescriptor;var w=Object.getOwnPropertyNames;var x=Object.prototype.hasOwnProperty;var $=(o,t)=>{for(var e in t)m(o,e,{get:t[e],enumerable:!0})},S=(o,t,e,s)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of w(t))!x.call(o,r)&&r!==e&&m(o,r,{get:()=>t[r],enumerable:!(s=b(t,r))||s.enumerable});return o};var v=o=>S(m({},"__esModule",{value:!0}),o);var P={};$(P,{Errors:()=>O,Extension:()=>y,Patch:()=>p,PatchEntry:()=>h,PatchToggle:()=>d});var E=o=>/(\w+)]/.exec(Object.prototype.toString.call(o))[1],u=class extends Error{constructor(t,e){super(`${E(t)} disallows tampering with ${e}.`),Object.assign(this,{owner:t,key:e})}get[Symbol.toStringTag](){return this.constructor.name}};var A=o=>/(\w+)]/.exec(Object.prototype.toString.call(o))[1],f=class extends Error{constructor(t,e){super(`${A(t)} does not have a property named '${e}'.`),Object.assign(this,{owner:t,key:e})}get[Symbol.toStringTag](){return this.constructor.name}};var d=class{constructor(t,e=!1){this.started=!1,this.preventRevert=e,this.patch=t,this.patchName=t.owner?.name??t.owner?.constructor?.name??/(\w+)]/.exec(Object.prototype.toString.call(t.owner))[1],this.state={needsApplication:!1,needsReversion:!1}}start(){return this.started||(this.state.needsApplication=!this.patch.applied,this.state.needsReversion=this.patch.applied,this.started=!0,this.state.needsApplication&&this.patch.apply()),this}stop(){return this.started&&((this.preventRevert||this.patch.applied)&&this.patch.revert(),this.state.needsApplication=!1,this.state.needsReversion=!1,this.started=!1),this}get[Symbol.toStringTag](){return`${this.constructor.name}:${this.patchName}`}[Symbol.for("nodejs.util.inspect.custom")](t,e,s){let r=this[Symbol.toStringTag],i=`(started: ${this.started} needed: ${this.state.needsApplication})`;return s(`${r} ${i}`,{...e,depth:t})}};var h=class{constructor(t,e=globalThis,s=void 0){let r=n=>n==null,i=(n,a=["string","symbol"])=>!r(n)&&!!a.find(l=>l===typeof n),c=n=>i(n,["object"]);if(!i(t))throw console.error("Property",t,`(type: ${typeof t})`,"owningObject",e,`(type: ${typeof e})`,"condition",s,`(type: ${typeof s})`),new TypeError("Property must be non-null and either a string or symbol");if(!c(e))throw new TypeError("Cannot create Patch entry as owning object is invalid");Object.assign(this,{key:t,descriptor:Object.getOwnPropertyDescriptor(e,t),owner:e,condition:typeof s=="function"?s:void 0})}get computed(){return this.isAccessor?this.descriptor.get.bind(this.owner).call():this.descriptor.value}get isData(){return Reflect.has(this.descriptor,"value")}get isAccessor(){return Reflect.has(this.descriptor,"get")}get isReadOnly(){return Reflect.has(this.descriptor,"configurable")&&!this.descriptor.configurable||Reflect.has(this.descriptor,"writable")&&!this.descriptor.writable}get isAllowed(){return this.condition&&typeof this.condition=="function"?this.condition():!0}applyTo(t,e=!1){let s={...this.descriptor};e&&(typeof s.get=="function"&&(s.get=s.get.bind(this.owner)),typeof s.set=="function"&&(s.set=s.set.bind(this.owner))),Object.defineProperty(t,this.key,s)}get[Symbol.toStringTag](){return this.constructor.name}[Symbol.for("nodejs.util.inspect.custom")](t,e,s){let r=this.isData?" Data":" Accessor",i=this.isReadOnly?" [ReadOnly]":"";return`PatchEntry<${this.key}${r}${i}>`}};var p=class o{patchConflicts={};patchEntries={};patchesOwner=void 0;patchCount=0;patchesApplied=0;constructor(t,e,s={}){Object.assign(this,{owner:t,options:s}),this.patchesOwner=e;let r=this?.options.condition;Reflect.ownKeys(e).forEach(i=>{let c=this?.options?.conditions?.[i]??r;try{this.patchEntries[i]=new h(i,this.patchesOwner,c),this.patchCount+=1}catch(n){console.error(`Failed to process patch for ${i}
`,n)}if(Reflect.has(this.owner,i))try{this.patchConflicts[i]=new h(i,this.owner)}catch(n){console.error(`Cannot capture conflicting patch key ${i}
`,n)}}),o.patches.has(t)||o.patches.set(t,[]),o.patches.get(t).push(this)}get entries(){return Reflect.ownKeys(this.patchEntries).map(t=>[t,this.patchEntries[t]])}get appliedEntries(){return Reflect.ownKeys(this.patchEntries).filter(t=>this.patchState.get(t)===!0).map(t=>[t,this.patchEntries[t]])}get unappliedEntries(){return Reflect.ownKeys(this.patchEntries).filter(t=>this.patchState.get(t)===!1).map(t=>[t,this.patchEntries[t]])}get patches(){return this.entries.reduce((t,[e,s])=>(t[e]=s.computed,t),{})}get appliedPatches(){return this.entries.reduce((t,[e,s])=>(this.patchState.get(e)===!0&&(t[e]=s.computed),t),{})}get unappliedPatches(){return this.entries.reduce((t,[e,s])=>(this.patchState.get(e)===!1&&(t[e]=s.computed),t),{})}get patchKeys(){return this.entries.map(([t,e])=>t)}get conflicts(){return Reflect.ownKeys(this.patchConflicts).map(t=>[t,this.patchConflicts[t]])}get applied(){return this.patchesApplied>0}get isPartiallyPatched(){return this.applied}get isFullyPatched(){return this.patchCount==this.patchesApplied}apply(t){let e=this.entries,s={patches:e.length,applied:0,errors:[],notApplied:e.length};this.patchState.clear(),e.forEach(([,r])=>{if(r.isAllowed){Object.defineProperty(this.owner,r.key,r.descriptor);let i=Object.getOwnPropertyDescriptor(this.owner,r.key);this.#e(i,r.descriptor)?(s.applied+=1,s.notApplied-=1,this.patchState.set(r,!0)):(s.errors.push([r,new Error(`Could not apply patch for key ${r.key}`)]),this.patchState.set(r,!1))}else this.patchState.set(r,!1)}),this.patchesApplied=s.applied,typeof t=="function"&&t(s)}createToggle(t=!1){return new d(this,t)}revert(t){if(!this.applied)return;let e=this.entries,s=this.conflicts,r={patches:e.length,reverted:0,restored:0,conflicts:s.length,errors:[],stillApplied:0};e.forEach(([,i])=>{delete this.owner[i.key]?(this.patchesApplied-=1,r.reverted+=1,this.patchState.set(i,!1)):r.errors.push([i,new Error(`Failed to revert patch ${i.key}`)])}),s.forEach(([,i])=>{Object.defineProperty(this.owner,i.key,i.descriptor);let c=Object.getOwnPropertyDescriptor(this.owner,i.key);this.#e(i.descriptor,c)?r.restored+=1:r.errors.push([i,new Error(`Failed to restore original ${i.key}`)])}),r.stillApplied=this.patchesApplied,typeof t=="function"&&t(r)}release(){let t=o.patches.get(this.owner);t.splice(t.find(e=>e===this),1)}owner=null;options=null;patchState=new Map;[Symbol.iterator](){return this.entries.values()}#e(t,e){return!t||!e?!1:t.configurable===e.configurable&&t.enumerable===e.enumerable&&t.value===e.value&&t.writable===e.writable&&t.get===e.get&&t.set===e.set}[Symbol.for("nodejs.util.inspect.custom")](t,e,s){let r={get quotes(){return/^(\x1B\[\d+m)?['"]|["'](\x1B\[\d+m)?$/g},get arrays(){return/^(\x1B\[\d+m)?\[ | \](\x1B\[\d+m)?$/g}},i={...e,depth:t},c=this.owner?.name??"",n=c.length?`[${s(c,e).replaceAll(r.quotes,"$1$2")}]`:"",a=s(this.patchKeys,i).replaceAll(r.arrays,"$1$2").replaceAll(/'(.*?)'/g,"$1");return`${this.constructor.name}${n} { ${a} }`}static patches=new Map;static enableFor(t){if(o.patches.has(t))for(let e of o.patches.get(t))e.apply()}static disableFor(t){if(o.patches.has(t))for(let e of o.patches.get(t))e.revert()}static get applied(){return this.#t(globalThis,!0)}static get known(){return this.#t(globalThis,!1)}static get use(){return this.#t(globalThis,!1,!0)}static get lazy(){return this.#t(globalThis,!1,!1,!0)}static scopedTo(t){let e=(s,r,i=!1,c=!1)=>this.#t(s,r,i,c);return{get applied(){return e(t,!0,!1)},get known(){return e(t,!1,!1)},get use(){return e(t,!1,!0)},get lazy(){return e(t,!1,!1,!0)}}}static#t(t,e,s=!1,r=!1){return[...o.patches.values()].flat().filter(i=>i.owner===t).reduce((i,c)=>{for(let[,n]of c.entries)if(!(e&&c.patchState.get(n)!==!0)){if(s){i[n.key]=async a=>{if(typeof a!="function")return;let l=Object.prototype.toString.call(a),g=c.createToggle();g.start(),l==="[object AsyncFunction]"?await a(n.computed,n):a(n.computed,n),g.stop()};continue}if(r){Object.defineProperty(i,n.key,{get(){return c.apply(),n.computed},enumerable:!0,configurable:!0});continue}if(n.isAccessor){let a=`applyAccessorFor_${String(n.key)}`,l={[a](g){return n.applyTo(g),g}};i[n.key]=l[a]}else n.applyTo(i)}return i},{})}static get CustomInspect(){return Symbol.for("nodejs.util.inspect.custom")}static stripExtras(t){return t.replaceAll(/^(\x1B\[\d+m)?[\[\{]\s?|\s?[\]\}](\x1B\[\d+m)?$/gm,"$1$2").replaceAll(/['"](.*?)['"]/gm,"$1")}};var j=["number","boolean","bigint","string","symbol"],y=class o extends p{constructor(t,e,s=globalThis,r={}){let i=o.determineInput(t),{key:c,extension:n,valid:a}=i;if(n=e||n,!a)throw new f(s,c);let l=Object.getOwnPropertyDescriptor(s,c);if(l&&(Reflect.has(l,"writable")&&!l.writable||Reflect.has(l,"configurable")&&!l.configurable))throw new u(s,c);super(s,{[c]:n},r),this.key=c,this.class=i.class,this.function=i.function}get isFunction(){return!!this.function}get isClass(){return!!this.class}get isPrimitive(){return~j.indexOf(typeof this.value)}get isObject(){return Object(this.value)===this.value}static get applied(){return p.applied}static get known(){return p.known}static get use(){return p.use}static get lazy(){return p.lazy}static scopedTo(t){return p.scopedTo(t)}static determineInput(t){let e={key:null,extension:null,valid:!1};return t instanceof Function?(e={key:t.name,extension:t,valid:!0},/^class .*/.exec(t.toString())&&(e.class=t),/^(async )?function .*/.exec(t.toString())&&(e.function=t)):(typeof t=="string"||t instanceof String)&&(e={key:t,extension:null,valid:!0}),e}[Symbol.for("nodejs.util.inspect.custom")](t,e,s){let r={get braces(){return/^(\x1B\[\d+m)?[\[\{]|[\]\}](\x1B\[\d+m)?$/g},get quotes(){return/^(\x1B\[\d+m)?['"]|["'](\x1B\[\d+m)?$/g}},i=s(this.key,e).replaceAll(r.quotes,"$1$2"),c=s(this.patches[this.key],e).replaceAll(r.braces,"$1$2");return`Extension[${i}:${c}]`}get[Symbol.toStringTag](){return this.constructor.name}static createSet(t,...e){return new o.ExtensionSet(t,...e)}static ExtensionSet=class{constructor(e,...s){this.name=e,this.extensionObjects=new Set,this.extensions=new Set;for(let r of s)r instanceof o?(this.extensions.add(r),this.extensionObjects.add(r.patches[r.key])):r instanceof Function&&(this.extensionObjects.add(r),this.extensions.add(new o(r)))}apply(){for(let e of this.extensions)e.apply()}revert(){for(let e of this.extensions)e.revert()}}};var O={get CannotBeExtended(){return u},get MissingOwnerValue(){return f}};return v(P);})();
//# sourceMappingURL=extension.bundle.2.7.0.js.map