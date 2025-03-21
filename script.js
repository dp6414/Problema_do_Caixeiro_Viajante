let clickedEdge = null;
let nodes = [];
let nodeCount = 1;
let edges = new Map();
let selectedNode = null;
let selectedEdge = null;
var popup;
let clicky = true; 
let peso = 0;
let ctx = null;
let activePopup = false;
let tempEdge = null;
let caminho = [];
let wichGrafo = 0;
let timeperformance = 0;

function setup() {
	let canvas = createCanvas(1000, 800);
	canvas.parent('canvas-container'); 
	noLoop(); 
}

function draw() {
	if (!activePopup) {
		background(240);  
		strokeWeight(4); 
		textSize(13);    
		fill('white');
		textAlign(CENTER, CENTER);  
		for (let [node1, value] of edges) {
			for (let no of value) {
				let node2 = no[0];
				let peso = no[1];
				mx = (node1.x + node2.x) / 2;
				my = (node1.y + node2.y) / 2;
				m = (node2.y - node1.y) / (node2.x - node1.x);
				if(caminho.includes(node1) || caminho.includes(node2)){
					let i = caminho.indexOf(node1);
					if(caminho.at(i-1) == node2 || caminho.at((i+1)%caminho.length) == node2){
						stroke('red');
					}
					else{
						stroke('black');
					}
				}
				line(node1.x, node1.y, node2.x, node2.y);
				strokeWeight(2); 
				if (m > 0) {
					text(peso, mx + 15, my - 15);  
				} else {
					text(peso, mx - 10, my - 10);  
				}
				strokeWeight(4); 
				stroke('black');
			}
		}

		for (let node of nodes) {
			fill(node == selectedNode ? 'red' : 'black');  
			ellipse(node.x, node.y, 25, 25);
			noStroke();
			fill('white');
			textSize(14);
			text(node.name, node.x, node.y);
			stroke('black');
		}
	}
}
function mousePressed() {
	if(mouseX<=0 || mouseX>width ||mouseY<=0 || mouseY> height || !clicky){
		return;
	}

	let clickedNode = getClickedNode(mouseX, mouseY);


	if (clickedNode) {
		if (selectedNode == null) {
			selectedNode = clickedNode;
		} else if (selectedNode != clickedNode){
			if (!edges.has(selectedNode)) {
				edges.set(selectedNode, []);
			}
			if (!edges.has(clickedNode)) {
				edges.set(clickedNode, []);
			}
			if (!edges.get(selectedNode).some(no => no[0] == clickedNode)) {
				clickedEdge = [selectedNode, [clickedNode,null]];
				pesoPopup(); 
			}
			selectedNode = null;
			updateEdgeCount();
		}
		else selectedNode = null;
	} else {
		clickedEdge = getClickedEdge(mouseX,mouseY);
		if(clickedEdge != null){
			pesoPopup();
		}
		else{
			let nodeName = 64;
			let rep = true;
			while(rep){
				nodeName++;
				rep = false
				for (node of nodes){
					if(node.name == String.fromCharCode(nodeName)) rep = true;
				}
			}
			nodes.push({ x: mouseX, y: mouseY, name: String.fromCharCode(nodeName)});
			nodeCount ++;
			selectedNode = null;
			caminho = []
			caminhoUpdate();
			updateVertexCount(); 
		}
	}
	
	loop();
}

function belongsToEdge(node1,node2,x,y){
	let m = (node2.y - node1.y) / (node2.x - node1.x); 
	let b = node1.y - m * node1.x;
	if(x<Math.min(node1.x,node2.x)+1 || x>Math.max(node1.x,node2.x)-1 || y<Math.min(node1.y,node2.y)+1 || y>Math.max(node1.y,node2.y)-1) return false;
	for(let xs = x-10; xs<x+10; xs++){
		for(let ys = y-10; ys<y+10; ys++){
			if(xs>Math.min(node1.x,node2.x) && xs<Math.max(node1.x,node2.x) && ys>Math.min(node1.y,node2.y) && ys<Math.max(node1.y,node2.y)){
				if (Math.floor(xs * m + b) == Math.floor(ys)) return true;
			}
		}
	}
	return false;
}


function getClickedNode(x, y) {
	let r = null;
	for (let node of nodes) {
		let d = dist(x, y, node.x, node.y);
		if (d < 20) r = node;
	}
	return r;
}

function getClickedEdge(x,y){
	let r = null;
	for (let [node1,nos] of edges){
		for(let no of nos){
			let node2 = no[0]
			if (belongsToEdge(node1,node2,x,y)) r = [node1,no];
		}
	}
	return r;
}


function clearGraph() {
		nodes.length = 0;
		edges = new Map()
		selectedNode = null;
		selectedEdge = null;
		nodeCount = 1;
		caminho = []
		caminhoUpdate();
		updateVertexCount(); 
		updateEdgeCount();
		redraw();
	}


function updateVertexCount() {
	document.getElementById('vertex-count').innerText = `Número de Vértices: ${nodes.length}`;
}

function edgeCount(){
	let r = 0;
	for(let [node1,value] of edges){
		r+=value.length;
	}
	return r/2;
}

function updateEdgeCount(){
	let edgcount = edgeCount();
	document.getElementById('edge-count').innerText = `Número de Arestas: ${edgcount}`;
}

function caminhoUpdate() {
	if (caminho.length > 0) {
		let out = caminho.map(a => a.name).join(' -> ');
		document.getElementById('solAlgoritmo').innerText = "Caminho: " + out +"\nPeso: " + peso + "\nTempo de resposta: " + timeperformance.toFixed(3) + "ms";
	}
	else{
		document.getElementById("solAlgoritmo").innerText = "";
	}
}



function nodeRemove(){
	if(selectedNode){
		edges.delete(selectedNode)
		for([node1, no] of edges){
			edges.set(node1,no.filter(n => n[0] != selectedNode))
		}
		caminho = []
		caminhoUpdate();
		updateEdgeCount();

		nodes = nodes.filter(node => node != selectedNode);

		updateVertexCount();
		nodeCount --;

		redraw();
		selectedNode = null
	}
	
}

function delAresta(){
	edges.set(clickedEdge[0],edges.get(clickedEdge[0]).filter(edge => edge[0] != clickedEdge[1][0]));
	edges.set(clickedEdge[1][0],edges.get(clickedEdge[1][0]).filter(edge => edge[0] != clickedEdge[0]));
	updateEdgeCount();
	hidePopup();
}

function inputPeso() {
	const input = document.getElementById('inputPeso');
	let peso = parseInt(input.value); 
	
	if (!isNaN(peso)) {
		edges.set(clickedEdge[0],edges.get(clickedEdge[0]).filter(edge => edge[0] != clickedEdge[1][0]));
		edges.get(clickedEdge[0]).push([clickedEdge[1][0], peso]);
		edges.set(clickedEdge[1][0],edges.get(clickedEdge[1][0]).filter(edge => edge[0] != clickedEdge[0]));
		edges.get(clickedEdge[1][0]).push([clickedEdge[0], peso]);
		caminho = []
		caminhoUpdate();
		updateEdgeCount();
	}

	clickedEdge = null; 
	hidePopup();
	redraw();
}


window.onload = function() {
	document.getElementById('clear-btn').addEventListener('click', clearGraph);
	document.getElementById('clearVertex-btn').addEventListener('click', nodeRemove);
	document.getElementById('inAresta').addEventListener('click', inputPeso);
	document.getElementById('delAresta').addEventListener('click', delAresta);
	popup = document.getElementById("popup");
	popup2 = document.getElementById("popup2");
	document.getElementById('vizinhoMaisProximo').addEventListener('click', vizinhoMaisProximo);
	document.getElementById('forcaBruta').addEventListener('click', bruteForce);
	document.getElementById('maisBarato').addEventListener('click', maisBarato);
	document.getElementById('inCode').addEventListener('click', function() {
		loadGrafo();
		document.getElementById('codes').value= '';
	});
	document.getElementById('gerarCode').addEventListener('click', gerarCodigo);
	document.getElementById('copyCode').addEventListener('click', copyCode);
	document.getElementById('grafo1').addEventListener('click', function() {
		wichGrafo = 1;  
		carregarGrafoEspecifico();     
	});
	document.getElementById('grafo2').addEventListener('click',function() {
		wichGrafo = 2;
		carregarGrafoEspecifico();
	})
}


function popupCode() {
	popup2.style.display = "flex";
	clicky = false;
	activePopup = true;
}

function hidePopupCode() {
	popup2.style.display = "none";
	clicky = true;
	activePopup=false;
}

function pesoPopup() {
		popup.style.display = "flex";
		clicky = false;
		activePopup = true;
}

function hidePopup() {
		popup.style.display = "none";
		clicky = true;
		activePopup=false;
		document.getElementById('inputPeso').value = '';
}

window.addEventListener("click", function (event) {
	if (event.target === popup) {
			hidePopup();
	}
});

window.addEventListener("click", function (event) {
	if (event.target === popup2) {
			hidePopupCode();
	}
});

function orderArestas(){
	for( let [node,no] of edges){
		edges.get(node).sort((a,b) => a[1] - b[1]);
	}
}

function vizinhoMaisProximo(){
	let start = performance.now();
	peso = 0;
	if(selectedNode != null){  
		orderArestas();
		caminho = [selectedNode];
		let nodeChoice = [-1];
		let currentChoice;
		let currentNode;
		let currentEdges = [];
		let i;

		while(caminho.length != 0){
			currentNode = caminho.at(-1);
			currentChoice = nodeChoice.pop()+1;
			currentEdges = edges.get(currentNode);
			if(caminho.length == nodes.length && currentEdges.some(edge => edge[0] == selectedNode)) break;
			for(i=currentChoice; i<currentEdges.length && caminho.includes(currentEdges[i][0]); i++);
			if(i==currentEdges.length) {
				caminho.pop();
				peso -= edges.get(caminho.at(-1))[nodeChoice.at(-1)][1];
			}
			else{
				nodeChoice.push(i);
				nodeChoice.push(-1);
				caminho.push(currentEdges[i][0]);
				peso += currentEdges[i][1];
			}
		}
		peso += currentEdges.find(e => e[0] == selectedNode)[1];
		selectedNode = null;
		let end = performance.now();
		timeperformance = end - start;
		caminhoUpdate();
		redraw(); 
	}
}

function b64EncodeUnicode(str) {
    return btoa(
        new TextEncoder().encode(str).reduce((acc, byte) => acc + String.fromCharCode(byte), '')
    );
}

function bruteForce(){
	let start = performance.now();
	peso = 0;
	if(selectedNode != null){  
		orderArestas();
		caminho.length = 0;
		let curCaminho = [selectedNode];
		let nodeChoice = [-1];
		let currentChoice;
		let currentNode;
		let currentEdges = [];
		let i;
		let curPeso = 0;

		while(curCaminho.length != 0){
			currentNode = curCaminho.at(-1);
			currentChoice = nodeChoice.pop()+1;
			currentEdges = edges.get(currentNode);
			if(curCaminho.length == nodes.length && currentEdges.some(edge => edge[0] == selectedNode)){
				curPeso += currentEdges.find(e => e[0] == selectedNode)[1];
				if(caminho.length == 0){
					peso = curPeso;
					caminho = Array.from(curCaminho);
				}
				else if(curPeso<peso){
					peso = curPeso;
					caminho = Array.from(curCaminho);
				}
				curPeso -= currentEdges.find(e => e[0] == selectedNode)[1];
				curCaminho.pop();
				curPeso -= edges.get(curCaminho.at(-1))[nodeChoice.at(-1)][1];
				continue;
			}
			for(i=currentChoice; i<currentEdges.length && curCaminho.includes(currentEdges[i][0]); i++);
			if(i==currentEdges.length || (caminho.length != 0 && curPeso > peso)) {
				curCaminho.pop();
				if(nodeChoice.length != 0 && curCaminho.length != 0){
					curPeso -= edges.get(curCaminho.at(-1))[nodeChoice.at(-1)][1];
				}
			}
			else{
				nodeChoice.push(i);
				nodeChoice.push(-1);
				curCaminho.push(currentEdges[i][0]);
				curPeso += currentEdges[i][1];
			}
		}
		selectedNode = null;
		let end = performance.now();
		timeperformance = end - start;
		caminhoUpdate();
		redraw(); 
	}
	saveGrafo();
}

function getLowestCost(curEdge){
	//curEdge tem que estar ordenado
	let lowPeso = Infinity;
	let lowEdges;
	for(let [node1,v] of curEdge){
		if(lowPeso >v[0][1]){
			lowPeso=v[0][1];
			lowEdges=[[node1,v[0]]];
		}
		else if (lowPeso == v[0][1]) lowEdges.push([node1,v[0]]);
	}
	return lowEdges;
}

function getMoreEdges(usableEdges,tempEdges){
	let lowEdges = getLowestCost(tempEdges);
	for(let lowEdge of lowEdges){
		tempEdges.get(lowEdge[0]).shift();
		if(tempEdges.get(lowEdge[0]).length==0) tempEdges.delete(lowEdge[0]);
		if(!usableEdges.get(lowEdge[0]).some(no=>no[0]==lowEdge[1][0])){
			usableEdges.get(lowEdge[0]).push(lowEdge[1]);
			usableEdges.get(lowEdge[1][0]).push([lowEdge[0],lowEdge[1][1]]);
		}
	}
}

function copyDict(dict){
	let newDict = new Map();
	for(let [key,v] of dict){
		newDict.set(key,Array.from(v));
	}
	return newDict
}

function getMinimumEdges(usableEdges,tempEdges){
	//tempEdges tem que estar ordenado
	for(let n of nodes){
		usableEdges.set(n,[]);
	}
	while([...usableEdges.values()].some(value => value.length<2)){
		getMoreEdges(usableEdges,tempEdges);
	}
}

function maisBarato(){
	if(!selectedNode) return;
	let start = performance.now();
	caminho=[];
	orderArestas();
	let tempEdges = copyDict(edges);
	let usableEdges = new Map();
	getMinimumEdges(usableEdges,tempEdges)
	let currentEdges;
	let currentChoice;
	let currentNode;
	let i;
	let nodeChoice
	while(caminho.length==0 && tempEdges.size!=0){
		peso=0; 
		caminho = [selectedNode];
		nodeChoice = [-1];
		currentEdges = [];
		while(caminho.length != 0){
			currentNode = caminho.at(-1);
			if(usableEdges.has(currentNode)){
				currentEdges = usableEdges.get(currentNode);
				currentChoice = nodeChoice.pop()+1;
				if(caminho.length == nodes.length && currentEdges.some(edge => edge[0] == selectedNode)) break;
				for(i=currentChoice; i<currentEdges.length && caminho.includes(currentEdges[i][0]); i++);
				if(i==currentEdges.length && caminho.length != 0) {
					caminho.pop();
					if(nodeChoice.length){
						peso -= usableEdges.get(caminho.at(-1))[nodeChoice.at(-1)][1];
					}
				}
				else{
					nodeChoice.push(i);
					nodeChoice.push(-1);
					caminho.push(currentEdges[i][0]);
					peso += currentEdges[i][1];
				}
			}
			else break;
		}
		getMoreEdges(usableEdges,tempEdges);
	}
	peso += currentEdges.find(e => e[0] == selectedNode)[1];
	selectedNode = null;
	let end = performance.now();
	timeperformance = end - start;
	caminhoUpdate();
	redraw(); 
}

function carregarGrafoEspecifico() {
	fetch("grafo.json")
			.then(response => response.json())
			.then(data => {

					nodes.length = 0;
					edges.clear();
					nodeCount = 0;
					let grafoEscolhido;
					let nodeMap = {};
					switch(wichGrafo){
						case 1:
							grafoEscolhido = data.graph1;
							break;
						case 2:
							grafoEscolhido = data.graph2;
							break;
					}

					grafoEscolhido.nodes.forEach(node => {
							let newNode = { x: node.x, y: node.y, name: node.name };
							nodes.push(newNode);
							nodeMap[node.name] = newNode;
							nodeCount++;
					})

					grafoEscolhido.edges.forEach(edge => {
							let fromNode = nodeMap[edge.from];
							let toNode = nodeMap[edge.to];
							let peso = edge.weight;

							if (!edges.has(fromNode)) edges.set(fromNode, []);
							edges.get(fromNode).push([toNode, peso]);

							if (!edges.has(toNode)) edges.set(toNode, []);
							edges.get(toNode).push([fromNode, peso]); 
					})
					updateVertexCount();
					caminho = []
					caminhoUpdate();
					updateEdgeCount();
					selectedNode = null;
					redraw();
			})
}

function saveGrafo(){
	let str = "";
	str += "(";
	for(let node1 of nodes){
		str += node1.name + "," + node1.x.toString() + "," + node1.y.toString() + "|";
	}
	str = str.slice(0,-1);
	str += ")"
	if(edges.size>0){
		for(let [node1,value] of edges){
			str += node1.name + ":";
			for(let [node2,peso] of value){
				str += node2.name + "=" + peso + ","
			}
			str = str.slice(0,-1);
			str+= "|"
		}
		str = str.slice(0,-1);
	}
	return b64EncodeUnicode(str);
}

function gerarCodigo(){
	document.getElementById('codigoGerado').innerText = saveGrafo();
	popupCode();
}

function decodeBase64(s) {
    let b64Text = s.value.trim(); // Remove spaces
    try {
        // Decode Base64 safely
        let decoded = atob(b64Text);
        return decoded
    } catch (error) {
        console.error("Invalid Base64:", error);
    }
}

function loadGrafo(){
	const s = document.getElementById('codes');
	nodes.length = 0;
	edges.clear();
	nodeCount = 0;
	let nodeMap = {};
	let code = decodeBase64(s);
	let ns = code.match(/\(.*\)/).join("").slice(1,-1);
	let es = code.slice(code.indexOf(")")+1);
	ns = ns.split("|");
	for(let n of ns){
		let node = n.split(",");
		let newNode = { name: node[0], x: Number(node[1]), y: Number(node[2])};
		nodeMap[node[0]] = newNode;
		nodes.push(newNode);
	}
	if(es.length>0){
		es = es.split("|");
		for(let e of es){
			let [node1,v] = e.split(":");
			v = v.split(",")
			for(let no of v){
				let [node2,peso] = no.split("=");
				peso = Number(peso);
				let fromNode = nodeMap[node1];
				let toNode = nodeMap[node2];
				if (!edges.has(fromNode)) edges.set(fromNode, []);
				if (!edges.has(toNode)) edges.set(toNode, []);
				if (!edges.get(fromNode).some(no => no[0] == toNode)){
					edges.get(fromNode).push([toNode, peso]);
					edges.get(toNode).push([fromNode, peso]);
				}
			}
		}
	}
	updateVertexCount();
	caminho = []
	caminhoUpdate();
	updateEdgeCount();
	redraw();
}

function copyCode(){
	let text = document.getElementById('codigoGerado').innerText;
	navigator.clipboard.writeText(text)
	hidePopupCode();
}