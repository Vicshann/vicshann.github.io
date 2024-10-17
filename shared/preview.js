
/*-----------------------------------------------------------------------------*/
/*
 Post ID is: "post-YYYY-MM-DD-index" (comparable)
*/
/*-----------------------------------------------------------------------------*/
function ReadPostList(doc, navidx, navurl)
{
 const menu = doc.getElementById("menu-content");    
 if(menu === null){console.log("No content menu!"); return;} 
 const links = menu.querySelectorAll("#menu-content a"); 
 var array = [];
 links.forEach((LinkItem) => {
        console.log(LinkItem.id + " " + "'" + LinkItem.textContent + "'" + " " + LinkItem.href);   
        const url = (navidx >= 0)?(LinkItem.getAttribute("href")):(LinkItem.href);  // href is incorrect in HOME page
        array.push( {id: LinkItem.id, nidx: navidx, nurl: navurl, name: LinkItem.textContent, link: url} );
        });  
 if(array != null)console.log("Total posts: " + array.length);        
 return array;        
}    
/*-----------------------------------------------------------------------------*/
function FetchPostList(urlObj)
{
 return new Promise((resolve, reject) => {    
   const xhttp = new XMLHttpRequest();
   xhttp.onload = () => {
       console.log("Http status: " + xhttp.status);
       if ((xhttp.readyState == 4) && (xhttp.status >= 200 && xhttp.status < 300) && (xhttp.responseText.length > 16)) {
          console.log("Parsing... " + xhttp.responseText.length);
          //console.log(xhttp.responseText);
          const parser = new DOMParser();
          const pdoc = parser.parseFromString(xhttp.responseText, 'text/html');
          if(pdoc !== null)resolve(ReadPostList(pdoc, urlObj.idx, urlObj.url));
          reject([]);
       } 
   }; 
   console.log("URL: " + urlObj.url);
   xhttp.open("GET", urlObj.url, true);
   xhttp.setRequestHeader('Content-Type', 'application/xhtml+xml;charset=utf-8;');
   xhttp.send();     
 });
}
/*-----------------------------------------------------------------------------*/  
// From NAV menu
function FetchCategories(nodes, array)  
{
 const IndexedNavUrls = Array.from(nodes).map((anchor, index) => {return {url: anchor.href, tag: anchor.classList, idx: index}});   // Convert NodeList to Array for easier manipulation            
 const promises = IndexedNavUrls.filter(url => !url.tag.contains('cat-none')).map(url => FetchPostList(url));  // Create an array of promises for each URL  // Remove elements with "cat-menu" class
 return Promise.all(promises)   // Use Promise.all to wait for all promises to resolve
   .then(results => {  
     //console.log("Complete everything");   
     const combinedResults = results.reduce((acc, data) => acc.concat(data), []);  // Combine results into a single array    
     combinedResults.sort((b, a) => a.id.localeCompare(b.id));   // Sort the combined results based on ID property 
     //console.log(combinedResults);  // Output the combined and sorted results    
     return combinedResults;
   })
   .catch(error => {
     console.error('Error fetching data:', error);
     return [];
   });       
}
/*-----------------------------------------------------------------------------*/  
function FetchContents(event, element) 
{
 const isInIframe = window !== window.parent;
 console.log("Hello FetchContents");
 if(!isInIframe)return;
     
 console.log("Inside iframe!");
 const win = window.parent;
 if(win === null){console.log("No window!"); return;}
 const doc = win.document;
 if(doc === null){console.log("No document!"); return;}
 
 const menu = doc.getElementById("menu-content");
 if(menu === null)  // HOME
  {   
   console.log("No contents menu!");
   const mnav = doc.getElementById("menu-primary");
   if(mnav === null){console.log("No menu!"); return;}
   mnav.firstElementChild.firstElementChild.firstElementChild.checked = true;  // HOME
   
   const cat_links = mnav.querySelectorAll("#menu-primary a"); 
     FetchCategories(cat_links).then(combinedResults => {
     console.log("Total async: " + combinedResults.length); 
     LoadRecentList(combinedResults, window.document); 
     const elm = window.document.getElementById("recent-body");
     if(elm !== null)elm.setAttribute("class", "body-home");    
  });
  }   
   else {
     var array = ReadPostList(doc, -1, "");  // TODO: Get current NAV index
     array = array.sort((b, a) => a.id.localeCompare(b.id));
     console.log("Total: " + array.length); 
     LoadRecentList(array, window.document);
   }
}
/*-----------------------------------------------------------------------------*/
function PostIdToLocalDate(id)
{
 var parts = id.split("-");
 var dt = new Date(parseInt(parts[1], 10),
                   parseInt(parts[2], 10) - 1,
                   parseInt(parts[3], 10)); 
 const options = {
 //  weekday: 'long',
   year: 'numeric',
   month: 'long',
   day: 'numeric',
 };                  
 return dt.toLocaleDateString(undefined, options);   
}
/*-----------------------------------------------------------------------------*/
// TODO: Remove duplicated by ID
function LoadRecentList(arr, doc)
{
 const list = doc.getElementById("preview-list");   
 arr.forEach((itm) => {    
   console.log(itm.id); 

 var link = document.createElement("a");
 var item = document.createElement("li");
 var divw = document.createElement("div");
 var span = document.createElement("span");

 var pdat = document.createElement("b");
 var pnam = document.createElement("i");
 
 var sum  = document.createElement("summary");
 var det  = document.createElement("details");
 
 pdat.appendChild(document.createTextNode(PostIdToLocalDate(itm.id) + ": "));
 pnam.appendChild(document.createTextNode(itm.name));
 span.appendChild(pdat);
 span.appendChild(pnam);
 link.appendChild(document.createTextNode("🢂"));
 if(itm.nidx >= 0)  // On HOME
  {   
   link.setAttribute("href", itm.nurl);
   link.setAttribute("data-url", itm.link);  // Actual page link
   link.setAttribute("data-pid", itm.id); 
   link.setAttribute("data-nidx", itm.nidx); 
   link.setAttribute("onclick", "FollowPreview(event,this)"); 
  }  
   else link.setAttribute("href", itm.link);  // On a content page already
 
 divw.appendChild(span);
 divw.appendChild(link);
 sum.appendChild(divw);
 sum.setAttribute("onclick", "UpdatePreview(event,this)");  // To load preview

 det.appendChild(sum);
 det.appendChild(document.createElement("section"));
 item.appendChild(det);
 list.appendChild(item); 
 
 var sepi = document.createElement("li");
 sepi.appendChild(document.createElement("hr"));
 list.appendChild(sepi);
 }); 
}   
/*-----------------------------------------------------------------------------*/
function FetchPostPreview(url)
{
 return new Promise((resolve, reject) => {    
   const xhttp = new XMLHttpRequest();
   xhttp.onerror = () => {reject("");};
   xhttp.onload = () => {
       console.log("Http status: " + xhttp.status);
       if ((xhttp.readyState == 4) && (xhttp.status >= 200 && xhttp.status < 300) && (xhttp.responseText.length > 16)) {
          console.log("Parsing... " + xhttp.responseType + " : " + xhttp.responseText.length);
          //console.log(xhttp.responseText);
          const parser = new DOMParser();
          const pdoc = parser.parseFromString(xhttp.responseText, 'text/html');
          if(pdoc !== null)resolve(pdoc.getElementById("content").innerText);
          reject("");
       } 
       reject("");
   }; 
   console.log("URL: " + url);
   xhttp.open("GET", url, true); 
   xhttp.setRequestHeader('Range', 'bytes=0-512');  // NOTE: Likely will be ignored
   xhttp.setRequestHeader('Content-Type', 'application/xhtml+xml;charset=utf-8;');
   xhttp.send();     
 });       
}
/*-----------------------------------------------------------------------------*/
function UpdatePreview(event, element) 
{
 //console.log("Hello UpdatePreview");
 const sect = element.nextSibling;
 if(sect.textContent.length >= 20)return;  // Already fetched
 const link = element.querySelector('a');
 var   curl = link.getAttribute("href");
 var   durl = link.getAttribute("data-url");
 const dpid = link.getAttribute("data-pid");
 const nidx = link.getAttribute("data-nidx");
 var   purl = curl;  // URL to fetch preview
 var   lurl = curl;  // URL to follow
 if(durl !== null)   // We are at HOME recent page
  {
   console.log("curl: " + curl); 
   console.log("durl: " + durl); 
   purl = curl.substring(0, curl.lastIndexOf("/")) + "/" + durl; 
   console.log("Page: " + durl);  
  }     
 console.log("PageURL: " + purl);  
 console.log("LinkURL: " + lurl); 
 sect.textContent = "Loading preview...";
 FetchPostPreview(purl).then(
   (page) => {
     console.log("Total async text: " + page.length); 
     if(page.length > 0)
     {   
      var MaxLen = 800;
      if(page.length < MaxLen)MaxLen = page.length;
      var text = page.substring(0, MaxLen)
 //     console.log(text);
      if(page.length > text.length)text += "…";    
      var link = document.createElement("a");
      link.appendChild(document.createTextNode(text));
      link.setAttribute("href", lurl);
      if(durl !== null)
       {   
        link.setAttribute("data-url", purl);
        link.setAttribute("data-pid", dpid);
        link.setAttribute("data-nidx", nidx);
        link.setAttribute("onclick", "FollowPreview(event,this)");
       }   
      sect.textContent = "";
      sect.appendChild(link);  //textContent = text;
     }
       else sect.textContent = "ERROR";
   
  },
   (error) => { 
      sect.textContent = "ERROR";
      console.log("FAIL: " + url); 
  });
}
/*-----------------------------------------------------------------------------*/
function FollowPreview(event, element) 
{
 const win = window.parent;
 if(win === null)return;  
 
 const durl = element.getAttribute("data-url");
 const dpid = element.getAttribute("data-pid");
 const nidx = element.getAttribute("data-nidx");  
 console.log("Hello follow: " + dpid + " : " + nidx + " : " + durl); 
 win.dataUrl  = durl;
 win.dataPid  = dpid;
 win.dataNidx = nidx;
}
/*-----------------------------------------------------------------------------*/