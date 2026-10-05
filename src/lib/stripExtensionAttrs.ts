/**
 * Browser extensions (Bitdefender, Grammarly, ColorZilla, etc.) inject attributes
 * into the DOM before React hydrates, which triggers Next.js hydration mismatch
 * overlays — including on internal nodes we cannot mark with suppressHydrationWarning.
 *
 * Inline + beforeInteractive so it runs before hydration.
 */
export const STRIP_EXTENSION_ATTRS_SCRIPT = `(function(){
  var PREFIXES=['bis_','data-gr-','data-new-gr-'];
  var EXACT=['cz-shortcut-listen','data-lt-installed'];
  function shouldStrip(name){
    if(!name)return false;
    for(var i=0;i<EXACT.length;i++){if(name===EXACT[i])return true;}
    for(var j=0;j<PREFIXES.length;j++){if(name.indexOf(PREFIXES[j])===0)return true;}
    return false;
  }
  function strip(el){
    if(!el||el.nodeType!==1||!el.getAttributeNames)return;
    var names=el.getAttributeNames();
    for(var i=0;i<names.length;i++){
      if(shouldStrip(names[i]))el.removeAttribute(names[i]);
    }
  }
  function walk(root){
    strip(root);
    if(!root||!root.querySelectorAll)return;
    var all=root.querySelectorAll('*');
    for(var i=0;i<all.length;i++)strip(all[i]);
  }
  try{
    walk(document.documentElement);
    new MutationObserver(function(mutations){
      for(var i=0;i<mutations.length;i++){
        var m=mutations[i];
        if(m.type==='attributes'&&m.target)strip(m.target);
        var nodes=m.addedNodes;
        for(var j=0;j<nodes.length;j++){
          if(nodes[j].nodeType===1)walk(nodes[j]);
        }
      }
    }).observe(document.documentElement,{subtree:true,childList:true,attributes:true});
  }catch(e){}
})();`;
