	var url="//cdn.mozilla.net/pdfjs/tracemonkey.pdf";
	PDFJS.workerSrc="//mozilla.github.io/pdf.js/build/pdf.worker.js";
	
	var rendering=false,
		renderNum=null,
		pageNum=1,
		pdfDoc=null,
		canvas=document.getElementById("the-canvas"),
		ctx=canvas.getContext("2d"),
		scale=0.8;
	
	function renderPage(num){
		rendering=true;
		pdfDoc.getPage(num).then(function(page){
			var viewport=page.getViewport(scale);
			canvas.width=viewport.width;
			canvas.height=viewport.height;
			
			var renderContent={
				canvasContext:ctx,
				viewport:viewport
			}
			var renderTask=page.render(renderContent);
			renderTask.promise.then(function(){
				rendering=false;
				if(renderNum!=null){
					renderPage(renderNum);
					renderNum=null;
				}
			})
		});
		document.getElementById("cur-page").textContent=pageNum;
	}
	function changePage(num){		
		if(rendering){
			renderNum=num;
		}else{
			renderPage(num);
		}
	}
	function prevPage(){
		if(pageNum<=1) return;
		pageNum--;
		changePage(pageNum);
	}
	function nextPage(){
		if(pageNum>=pdfDoc.numPages) return;
		pageNum++;
		changePage(pageNum);
	}
	document.getElementById("prev").addEventListener("click",prevPage,false);
	document.getElementById("next").addEventListener("click",nextPage,false);
	
	PDFJS.getDocument(url).then(function(_pdf){
		pdfDoc=_pdf;
		document.getElementById("total-pages").textContent=pdfDoc.numPages;
		renderPage(pageNum);
	})
