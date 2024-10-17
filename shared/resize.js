
/*-----------------------------------------------------------------------------*/
function FixBodyTopOffs()
{
 const hrect = document.getElementById('nav-primary').getBoundingClientRect();  
 const mifrm = document.getElementById('site-content');
 const ifdoc = mifrm.contentDocument; 
 
 const recnt = ifdoc.getElementById('preview-list');  // When loaded directly into content iframe (HOME)
 if(recnt === null)
  {
   const contt = ifdoc.getElementById('wrap-sidebar-content');
   if(contt !== null)
    {
     var height  = hrect.height;   
     const bhaml = ifdoc.getElementById('hamburger-left');   
     if(bhaml !== null)   
      {
       const cr = bhaml.getBoundingClientRect();
       height -= cr.height;
      }           
     contt.style.top = height + "px";
   //  console.log("test:" + height);
    } 
  } 
   else recnt.style.top = hrect.height + "px";
 ResizeIFrames(mifrm);
}
/*-----------------------------------------------------------------------------*/
function ResizeIFrames(ifmain)
{
 const inner = ifmain.contentWindow.document.getElementById('page-content');
 if(inner !== null)FixContentHeight(inner);
  else FixContentHeight(ifmain);
}
/*-----------------------------------------------------------------------------*/
// Call in 'onload' of an iframe  // Do not forget 'scrolling="no"' on an IFRAME to hide the scrollbar
function FixContentHeight(elm)
{
 var height = elm.contentWindow.document.body.clientHeight;  // scrollHeight
// console.log("Heights: " + height + " : " + elm.style.minHeight);  
 const style = window.getComputedStyle(elm);
 const minhpx = style.getPropertyValue("min-height");
 const minh = parseInt(minhpx, 10);
 console.log("Fitting: " + height + " : " + minh); 
 if(height < minh)height = minh;  // No overflow  // Magic 100 :)
 height += 200;   // Some padding
// console.log("Height: " + elm.id + " : " + height); 
 elm.style.height = height+"px";   // minHeight
 elm.style.overflow = "hidden";
 const win = window.parent;
 if(win != null)
  {
   const doc = win.document;
   if(doc != null)
    {
     const frame = doc.getElementById("site-content");
     if(frame != null)   // Main page
      {
       console.log("Fitting parent: " + frame.id);   
       frame.style.height = height+"px"; 
       frame.style.overflow = "hidden";
      }    
    }   
  }  
}
/*-----------------------------------------------------------------------------*/
// Set category when coming from HOME recent
function RestoreStateR()
{  
 const win = window.parent;
 if(win === null)return; 
 const curl = win.dataUrl;  
 const dpid = win.dataPid;
 const nidx = win.dataNidx; 
// console.log("Data: " + dpid + " : " + nidx + " : " + curl);
 if((curl == null)||(dpid == null)||(nidx == null))return;  // 'undefined' is not accepted too

 const  doc = window.document;
 const ifrm = doc.getElementById("page-content");
 if(ifrm !== null)ifrm.src = curl;
 const prec = doc.getElementById(dpid);
 if(prec !== null)prec.previousSibling.checked = true;
 const pnav = win.document.getElementById("menu-primary");
 if(pnav !== null)
  {
   const elm = pnav.children[nidx];   
   if(elm !== null)elm.firstElementChild.firstElementChild.checked = true;    
  }  
 win.dataUrl  = null;
 win.dataPid  = null;
 win.dataNidx = null;
}
/*-----------------------------------------------------------------------------*/