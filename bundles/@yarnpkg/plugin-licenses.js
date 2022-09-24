/* eslint-disable */
//prettier-ignore
module.exports = {
name: "@yarnpkg/plugin-licenses",
factory: function (require) {
var plugin=(()=>{var ae=Object.create,U=Object.defineProperty;var ce=Object.getOwnPropertyDescriptor;var le=Object.getOwnPropertyNames,B=Object.getOwnPropertySymbols,pe=Object.getPrototypeOf,V=Object.prototype.hasOwnProperty,de=Object.prototype.propertyIsEnumerable;var z=(e,t,n)=>t in e?U(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,j=(e,t)=>{for(var n in t||(t={}))V.call(t,n)&&z(e,n,t[n]);if(B)for(var n of B(t))de.call(t,n)&&z(e,n,t[n]);return e};var fe=e=>U(e,"__esModule",{value:!0});var d=e=>{if(typeof require!="undefined")return require(e);throw new Error('Dynamic require of "'+e+'" is not supported')};var R=(e,t)=>{for(var n in t)U(e,n,{get:t[n],enumerable:!0})},ue=(e,t,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let i of le(t))!V.call(e,i)&&i!=="default"&&U(e,i,{get:()=>t[i],enumerable:!(n=ce(t,i))||n.enumerable});return e},f=e=>ue(fe(U(e!=null?ae(pe(e)):{},"default",e&&e.__esModule&&"default"in e?{get:()=>e.default,enumerable:!0}:{value:e,enumerable:!0})),e);var Le={};R(Le,{default:()=>xe});var ne=f(d("@yarnpkg/cli")),L=f(d("@yarnpkg/core")),v=f(d("clipanion"));var a=f(d("@yarnpkg/core")),m=f(d("@yarnpkg/fslib"));var W={};R(W,{fs:()=>he,getPackagePath:()=>me});var K=f(d("@yarnpkg/plugin-pnp")),$=f(d("@yarnpkg/core")),F=f(d("@yarnpkg/fslib")),q=f(d("@yarnpkg/libzip")),me=async(e,t)=>{ge(e);let n=$.structUtils.convertPackageToLocator(t),i={name:$.structUtils.stringifyIdent(n),reference:n.reference},r=A.getPackageInformation(i);if(!r)return null;let{packageLocation:o}=r;return o},A,ge=e=>{A||(A=module.require((0,K.getPnpPath)(e).cjs))},he=new F.VirtualFS({baseFs:new F.ZipOpenFS({libzip:(0,q.getLibzipSync)(),readOnlyArchives:!0})});var H={};R(H,{_getYarnStateAliases:()=>G,fs:()=>ke,getPackagePath:()=>Pe});var x=f(d("@yarnpkg/core")),J=f(d("@yarnpkg/parsers")),w=f(d("@yarnpkg/fslib")),Pe=async(e,t)=>{await ye(e);let n=x.structUtils.convertPackageToLocator(t),i=x.structUtils.stringifyLocator(n),r=E[i]||Z[i];if(!r)return null;let o=r.locations[0];return o?w.ppath.join(e.cwd,o):e.cwd},E,Z,ye=async e=>{if(!E){let t=w.ppath.join(e.configuration.projectCwd,w.Filename.nodeModules,".yarn-state.yml");E=(0,J.parseSyml)(await w.xfs.readFilePromise(t,"utf8")),Z=G(E)}},ke=w.xfs,G=e=>Object.entries(e).reduce((t,[n,i])=>{if(!i.aliases)return t;let r=x.structUtils.parseLocator(n);for(let o of i.aliases){let l=x.structUtils.makeLocator(r,o),P=x.structUtils.stringifyLocator(l);t[P]=i}return t},{});var Y=e=>{switch(e){case"pnp":return W;case"node-modules":return H;default:throw new Error("Unsupported linker")}};var Ae=m.npath.basename(__dirname)==="@yarnpkg"?m.ppath.join(m.npath.toPortablePath(__dirname),"../.."):m.ppath.join(m.npath.toPortablePath(__dirname),".."),Q=async(e,t,n,i,r)=>{let o={},l={children:o},P=await X(e,n,i),u=Y(e.configuration.get("nodeLinker"));for(let[s,c]of P.entries()){let p=await u.getPackagePath(e,c);if(p===null)continue;let h=JSON.parse(await u.fs.readFilePromise(m.ppath.join(p,m.Filename.manifest),"utf8")),{license:g,url:N,vendorName:T,vendorUrl:I}=ve(h);o[g]||(o[g]={value:a.formatUtils.tuple(a.formatUtils.Type.NO_HINT,g),children:{}});let M=a.structUtils.convertPackageToLocator(c),y=a.formatUtils.tuple(a.formatUtils.Type.DEPENDENT,{locator:M,descriptor:s}),k=r?{}:j(j(j({},N?{url:{value:a.formatUtils.tuple(a.formatUtils.Type.NO_HINT,_("URL",N,t))}}:{}),T?{vendorName:{value:a.formatUtils.tuple(a.formatUtils.Type.NO_HINT,_("VendorName",T,t))}}:{}),I?{vendorUrl:{value:a.formatUtils.tuple(a.formatUtils.Type.NO_HINT,_("VendorUrl",I,t))}}:{}),re={value:y,children:k},se=a.structUtils.stringifyLocator(M),oe=o[g].children;oe[se]=re}return l},X=async(e,t,n)=>{var P,u;let i=new Map,r;if(t){if(n){for(let c of e.workspaces)c.manifest.devDependencies.clear(),((P=c.manifest.name)==null?void 0:P.scope)==="flocon-trpg"&&((u=c.manifest.name)==null?void 0:u.name)==="api-server"&&(c.manifest.dependencies.clear(),c.manifest.peerDependencies.clear());let s=await a.Cache.find(e.configuration);await e.resolveEverything({report:new a.ThrowReport,cache:s})}r=e.storedDescriptors.values()}else r=e.workspaces.flatMap(s=>{let c=[s.anchoredDescriptor];for(let[p,h]of s.dependencies.entries())n&&s.manifest.devDependencies.has(p)||c.push(h);return c});let o=a.miscUtils.sortMap(r,[s=>a.structUtils.stringifyIdent(s),s=>a.structUtils.isVirtualDescriptor(s)?"0":"1",s=>s.range]),l=new Set;for(let s of o.values()){let c=e.storedResolutions.get(s.descriptorHash);if(!c)continue;let p=e.storedPackages.get(c);if(!p)continue;let{descriptorHash:h}=a.structUtils.isVirtualDescriptor(s)?a.structUtils.devirtualizeDescriptor(s):s;l.has(h)||(l.add(h),i.set(s,p))}return i};function we(e){let t={},n=e.match(/^([^(<]+)/);if(n){let o=n[0].trim();o&&(t.name=o)}let i=e.match(/<([^>]+)>/);i&&(t.email=i[1]);let r=e.match(/\(([^)]+)\)/);return r&&(t.url=r[1]),t}var ve=e=>{let{license:t,licenses:n,repository:i,homepage:r,author:o}=e,l=typeof o=="string"?we(o):o;return{license:(()=>{if(t)return D(t);if(n){if(!Array.isArray(n))return D(n);if(n.length===1)return D(n[0]);if(n.length>1)return`(${n.map(D).join(" OR ")})`}return ee})(),url:(i==null?void 0:i.url)||r,vendorName:l==null?void 0:l.name,vendorUrl:r||(l==null?void 0:l.url)}},ee="UNKNOWN",D=e=>(typeof e!="string"?e.type:e)||ee,_=(e,t,n)=>n?t:`${e}: ${t}`,te=async(e,t,n)=>{let i=await X(e,t,n),r=Y(e.configuration.get("nodeLinker")),o=new Map;for(let P of i.values()){let u=await r.getPackagePath(e,P);if(u===null)continue;let s=JSON.parse(await r.fs.readFilePromise(m.ppath.join(u,m.Filename.manifest),"utf8")),p=(await r.fs.readdirPromise(u,{withFileTypes:!0})).filter(y=>y.isFile()).map(({name:y})=>y),h=p.find(y=>{let k=y.toLowerCase();return k==="license"||k.startsWith("license.")||k==="unlicense"||k.startsWith("unlicense.")});if(!h)continue;let g=await r.fs.readFilePromise(m.ppath.join(u,h),"utf8"),N=p.find(y=>{let k=y.toLowerCase();return k==="notice"||k.startsWith("notice.")}),T;N&&(T=await r.fs.readFilePromise(m.ppath.join(u,N),"utf8"));let I=T?`${g}

NOTICE

${T}`:g,M=o.get(I);M?M.set(s.name,s):o.set(I,new Map([[s.name,s]]))}let l=`THE FOLLOWING SETS FORTH ATTRIBUTION NOTICES FOR THIRD PARTY SOFTWARE THAT MAY BE CONTAINED IN PORTIONS OF THE ${String(e.topLevelWorkspace.manifest.raw.name).toUpperCase().replace(/-/g," ")} PRODUCT.

`;for(let[P,u]of o.entries()){l+=`-----

`;let s=[],c=[];for(let{name:h,repository:g}of u.values())s.push(h),(g==null?void 0:g.url)&&c.push(u.size===1?g.url:`${g.url} (${h})`);let p=[];p.push(`The following software may be included in this product: ${s.join(", ")}.`),c.length>0&&p.push(`A copy of the source code may be downloaded from ${c.join(", ")}.`),p.push("This software contains the following license and notice below:"),l+=`${p.join(" ")}

`,l+=`${P.trim()}

`}return l};var S=class extends v.Command{constructor(){super(...arguments);this.recursive=v.Option.Boolean("-R,--recursive",!1,{description:"Include transitive dependencies (dependencies of direct dependencies)"});this.production=v.Option.Boolean("--production",!1,{description:"Exclude development dependencies"});this.json=v.Option.Boolean("--json",!1,{description:"Format output as JSON"});this.excludeMetadata=v.Option.Boolean("--exclude-metadata",!1,{description:"Exclude dependency metadata from output"})}async execute(){let t=await L.Configuration.find(this.context.cwd,this.context.plugins),{project:n,workspace:i}=await L.Project.find(t,this.context.cwd);if(!i)throw new ne.WorkspaceRequiredError(n.cwd,this.context.cwd);await n.restoreInstallState();let r=await Q(n,this.json,this.recursive,this.production,this.excludeMetadata);L.treeUtils.emitTree(r,{configuration:t,stdout:this.context.stdout,json:this.json,separators:1})}};S.paths=[["licenses","list"]],S.usage=v.Command.Usage({description:"display the licenses for all packages in the project",details:`
      This command prints the license information for packages in the project. By default, only direct dependencies are listed.

      If \`-R,--recursive\` is set, the listing will include transitive dependencies (dependencies of direct dependencies).

      If \`--production\` is set, the listing will exclude development dependencies.
    `,examples:[["List all licenses of direct dependencies","$0 licenses list"],["List all licenses of direct and transitive dependencies","$0 licenses list --recursive"],["List all licenses of production dependencies only","$0 licenses list --production"]]});var ie=f(d("@yarnpkg/cli")),C=f(d("@yarnpkg/core")),b=f(d("clipanion"));var O=class extends b.Command{constructor(){super(...arguments);this.recursive=b.Option.Boolean("-R,--recursive",!1,{description:"Include transitive dependencies (dependencies of direct dependencies)"});this.production=b.Option.Boolean("--production",!1,{description:"Exclude development dependencies"})}async execute(){let t=await C.Configuration.find(this.context.cwd,this.context.plugins),{project:n,workspace:i}=await C.Project.find(t,this.context.cwd);if(!i)throw new ie.WorkspaceRequiredError(n.cwd,this.context.cwd);await n.restoreInstallState();let r=await te(n,this.recursive,this.production);this.context.stdout.write(r)}};O.paths=[["licenses","generate-disclaimer"]],O.usage=b.Command.Usage({description:"display the license disclaimer including all packages in the project",details:`
      This command prints the license disclaimer for packages in the project. By default, only direct dependencies are listed.

      If \`-R,--recursive\` is set, the disclaimer will include transitive dependencies (dependencies of direct dependencies).

      If \`--production\` is set, the disclaimer will exclude development dependencies.
    `,examples:[["Include licenses of direct dependencies","$0 licenses generate-disclaimer"],["Include licenses of direct and transitive dependencies","$0 licenses generate-disclaimer --recursive"],["Include licenses of production dependencies only","$0 licenses list --production"]]});var Te={commands:[S,O]},xe=Te;return Le;})();
return plugin;
}
};
