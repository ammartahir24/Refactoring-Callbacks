"use strict";function _instanceof(e,t){if(t!=null&&typeof Symbol!=="undefined"&&t[Symbol.hasInstance]){return!!t[Symbol.hasInstance](e)}else{return e instanceof t}}function characters(e){return e.split("")}function member(e,t){return t.indexOf(e)>=0}function find_if(e,t){for(var n=t.length;--n>=0;){if(e(t[n]))return t[n]}}function repeat_string(e,t){if(t<=0)return"";if(t==1)return e;var n=repeat_string(e,t>>1);n+=n;return t&1?n+e:n}function configure_error_stack(e){Object.defineProperty(e.prototype,"stack",{get:function e(){var t=new Error(this.message);t.name=this.name;try{throw t}catch(e){return e.stack}}})}function DefaultsError(e,t){this.message=e;this.defs=t}DefaultsError.prototype=Object.create(Error.prototype);DefaultsError.prototype.constructor=DefaultsError;DefaultsError.prototype.name="DefaultsError";configure_error_stack(DefaultsError);function defaults(e,t,n){if(e===true)e={};var r=e||{};if(n)for(var i in r){if(HOP(r,i)&&!HOP(t,i)){throw new DefaultsError("`"+i+"` is not a supported option",t)}}for(var i in t){if(HOP(t,i)){r[i]=e&&HOP(e,i)?e[i]:t[i]}}return r}function merge(e,t){var n=0;for(var r in t){if(HOP(t,r)){e[r]=t[r];n++}}return n}function noop(){}function return_false(){return false}function return_true(){return true}function return_this(){return this}function return_null(){return null}var MAP=function(){function e(n,r,i){var s=[],u=[],o;function e(){var e=r(n[o],o);var t=_instanceof(e,l);if(t)e=e.v;if(_instanceof(e,a)){e=e.v;if(_instanceof(e,c)){u.push.apply(u,i?e.v.slice().reverse():e.v)}else{u.push(e)}}else if(e!==f){if(_instanceof(e,c)){s.push.apply(s,i?e.v.slice().reverse():e.v)}else{s.push(e)}}return t}if(Array.isArray(n)){if(i){for(o=n.length;--o>=0;){if(e())break}s.reverse();u.reverse()}else{for(o=0;o<n.length;++o){if(e())break}}}else{for(o in n){if(HOP(n,o))if(e())break}}return u.concat(s)}e.at_top=function(e){return new a(e)};e.splice=function(e){return new c(e)};e.last=function(e){return new l(e)};var f=e.skip={};function a(e){this.v=e}function c(e){this.v=e}function l(e){this.v=e}return e}();function push_uniq(e,t){if(e.indexOf(t)<0)return e.push(t)}function string_template(e,n){return e.replace(/\{(.+?)\}/g,function(e,t){return n&&n[t]})}function remove(e,t){var n=e.indexOf(t);if(n>=0)e.splice(n,1)}function makePredicate(e){if(!Array.isArray(e))e=e.split(" ");var t=Object.create(null);e.forEach(function(e){t[e]=true});return t}function all(e,t){for(var n=e.length;--n>=0;){if(!t(e[n]))return false}return true}function Dictionary(){this._values=Object.create(null);this._size=0}Dictionary.prototype={set:function e(t,n){if(!this.has(t))++this._size;this._values["$"+t]=n;return this},add:function e(t,n){if(this.has(t)){this.get(t).push(n)}else{this.set(t,[n])}return this},get:function e(t){return this._values["$"+t]},del:function e(t){if(this.has(t)){--this._size;delete this._values["$"+t]}return this},has:function e(t){return"$"+t in this._values},each:function e(t){for(var n in this._values){t(this._values[n],n.substr(1))}},size:function e(){return this._size},map:function e(t){var n=[];for(var r in this._values){n.push(t(this._values[r],r.substr(1)))}return n},clone:function e(){var t=new Dictionary;for(var n in this._values){t._values[n]=this._values[n]}t._size=this._size;return t},toObject:function e(){return this._values}};Dictionary.fromObject=function(e){var t=new Dictionary;t._size=merge(t._values,e);return t};function HOP(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function first_in_statement(e){var t=e.parent(-1);for(var n=0,r;r=e.parent(n++);t=r){if(r.TYPE=="Call"){if(r.expression===t)continue}else if(_instanceof(r,AST_Binary)){if(r.left===t)continue}else if(_instanceof(r,AST_Conditional)){if(r.condition===t)continue}else if(_instanceof(r,AST_PropAccess)){if(r.expression===t)continue}else if(_instanceof(r,AST_Sequence)){if(r.expressions[0]===t)continue}else if(_instanceof(r,AST_Statement)){return r.body===t}else if(_instanceof(r,AST_UnaryPostfix)){if(r.expression===t)continue}return false}}