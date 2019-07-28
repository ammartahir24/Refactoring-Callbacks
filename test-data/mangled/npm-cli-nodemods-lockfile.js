var fs=require("fs");var wx="wx";if(process.version.match(/^v0\.[0-6]/)){var c=require("constants");wx=c.O_TRUNC|c.O_CREAT|c.O_WRONLY|c.O_EXCL}var os=require("os");exports.filetime="ctime";if(os.platform()=="win32"){exports.filetime="mtime"}var debug;var util=require("util");if(util.debuglog)debug=util.debuglog("LOCKFILE");else if(/\blockfile\b/i.test(process.env.NODE_DEBUG))debug=function(){var e=util.format.apply(util,arguments);console.error("LOCKFILE %d %s",process.pid,e)};else debug=function(){};var locks={};function hasOwnProperty(e,t){return Object.prototype.hasOwnProperty.call(e,t)}var onExit=require("signal-exit");onExit(function(){debug("exit listener");Object.keys(locks).forEach(exports.unlockSync)});if(/^v0\.[0-8]\./.test(process.version)){debug("uncaughtException, version = %s",process.version);process.on("uncaughtException",function t(e){debug("uncaughtException");var r=process.listeners("uncaughtException").filter(function(e){return e!==t});if(!r.length){try{Object.keys(locks).forEach(exports.unlockSync)}catch(e){}process.removeListener("uncaughtException",t);throw e}})}exports.unlock=function(e,t){debug("unlock",e);delete locks[e];fs.unlink(e,function(e){t&&t()})};exports.unlockSync=function(e){debug("unlockSync",e);try{fs.unlinkSync(e)}catch(e){}delete locks[e]};exports.check=function(e,o,c){if(typeof o==="function")c=o,o={};debug("check",e,o);fs.open(e,"r",function(e,n){if(e){if(e.code!=="ENOENT")return c(e);return c(null,false)}if(!o.stale){return fs.close(n,function(e){return c(e,true)})}fs.fstat(n,function(t,r){if(t)return fs.close(n,function(e){return c(t)});fs.close(n,function(e){var t=Date.now()-r[exports.filetime].getTime();return c(e,t<=o.stale)})})})};exports.checkSync=function(e,t){t=t||{};debug("checkSync",e,t);if(t.wait){throw new Error("opts.wait not supported sync for obvious reasons")}try{var r=fs.openSync(e,"r")}catch(e){if(e.code!=="ENOENT")throw e;return false}if(!t.stale){try{fs.closeSync(r)}catch(e){}return true}if(t.stale){try{var n=fs.fstatSync(r)}finally{fs.closeSync(r)}var o=Date.now()-n[exports.filetime].getTime();return o<=t.stale}};var req=1;exports.lock=function(c,i,r){if(typeof i==="function")r=i,i={};i.req=i.req||req++;debug("lock",c,i);i.start=i.start||Date.now();if(typeof i.retries==="number"&&i.retries>0){debug("has retries",i.retries);var s=i.retries;i.retries=0;r=function(o){return function e(t,r){debug("retry-mutated callback");s-=1;if(!t||s<0)return o(t,r);debug("lock retry",c,i);if(i.retryWait)setTimeout(n,i.retryWait);else n();function n(){i.start=Date.now();debug("retrying",i.start);exports.lock(c,i,e)}}}(r)}fs.open(c,wx,function(e,t){if(!e){debug("locked",c,t);locks[c]=t;return fs.close(t,function(){return r()})}debug("failed to acquire lock",e);if(e.code!=="EEXIST"){debug("not EEXIST error",e);return r(e)}if(!i.stale)return notStale(e,c,i,r);return maybeStale(e,c,i,false,r)});debug("lock return")};function maybeStale(n,o,c,i,s){fs.stat(o,function(e,t){if(e){if(e.code==="ENOENT"){c.stale=false;debug("lock stale enoent retry",o,c);exports.lock(o,c,s);return}return s(e)}var r=Date.now()-t[exports.filetime].getTime();if(r<=c.stale)return notStale(n,o,c,s);debug("lock stale",o,c);if(i){exports.unlock(o,function(e){if(e)return s(e);debug("lock stale retry",o,c);fs.link(o+".STALE",o,function(e){fs.unlink(o+".STALE",function(){s(e)})})})}else{debug("acquire .STALE file lock",c);exports.lock(o+".STALE",c,function(e){if(e)return s(e);maybeStale(n,o,c,true,s)})}})}function notStale(e,t,r,n){debug("notStale",t,r);if(typeof r.wait!=="number"||r.wait<=0){debug("notStale, wait is not a number");return n(e)}var o=Date.now();var c=r.start||o;var i=c+r.wait;if(i<=o)return n(e);debug("now=%d, wait until %d (delta=%d)",c,i,i-c);var s=Math.min(i-c,r.pollPeriod||100);var u=setTimeout(a,s);function a(){debug("notStale, polling",t,r);exports.lock(t,r,n)}}exports.lockSync=function(t,r){r=r||{};r.req=r.req||req++;debug("lockSync",t,r);if(r.wait||r.retryWait){throw new Error("opts.wait not supported sync for obvious reasons")}try{var e=fs.openSync(t,wx);locks[t]=e;try{fs.closeSync(e)}catch(e){}debug("locked sync!",t,e);return}catch(e){if(e.code!=="EEXIST")return retryThrow(t,r,e);if(r.stale){var n=fs.statSync(t);var o=n[exports.filetime].getTime();if(!(o%1e3)&&r.stale%1e3){r.stale=1e3*Math.ceil(r.stale/1e3)}var c=Date.now()-o;if(c>r.stale){debug("lockSync stale",t,r,c);exports.unlockSync(t);return exports.lockSync(t,r)}}debug("failed to lock",t,r,e);return retryThrow(t,r,e)}};function retryThrow(e,t,r){if(typeof t.retries==="number"&&t.retries>0){var n=t.retries-1;debug("retryThrow",e,t,n);t.retries=n;return exports.lockSync(e,t)}throw r}
