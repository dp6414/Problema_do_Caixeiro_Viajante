let clickedEdge = null;
let nodes = [];
let nodeCount = 1;
let edges = new Map();
let selectedNode = null;
let selectedEdge = null;
let edgcount = 0;
var popup;
let clicky = true; 
let peso = 0;
let ctx = null;
let activePopup = false;
let tempEdge = null;
let caminho = [];
let arestasPercorridas = [];



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
    textAlign(CENTER, CENTER);  

    for (let [node1, value] of edges) {
      for (let no of value) {
        let node2 = no[0];
        let peso = no[1];
        mx = (node1.x + node2.x) / 2;
        my = (node1.y + node2.y) / 2;
        m = (node2.y - node1.y) / (node2.x - node1.x);

        let percorrida = arestasPercorridas.some(a => 
          (a[0] === node1.name && a[1] === node2.name) || (a[0] === node2.name && a[1] === node1.name)
        );

        stroke(percorrida ? 'red' : 'black');  
        line(node1.x, node1.y, node2.x, node2.y);
        
        if (m > 0) {
          text(peso, mx + 15, my - 15);  
        } else {
          text(peso, mx - 10, my - 10);  
        }
      }
    }

    for (let node of nodes) {
      fill(node == selectedNode ? 'red' : 'black');  
      ellipse(node.x, node.y, 25, 25);

      fill('white');
      textSize(14);
      text(node.name, node.x, node.y);
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
  } else {
    clickedEdge = getClickedEdge(mouseX,mouseY);
    if(clickedEdge != null){
      pesoPopup();
      edgcount--;
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
      updateVertexCount(); 
    }
  }
  
  loop();
}

function belongsToEdge(node1,node2,x,y){
  let m = (node2.y - node1.y) / (node2.x - node1.x); 
  let b = node1.y - m * node1.x;

  for(let xs = x-10; xs<x+10; xs++){
    for(let ys = y-10; ys<y+10; ys++){
      if (Math.floor(xs * m + b) == Math.floor(ys)) return true;
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
    arestasPercorridas.length = 0;
    nodes.length = 0;
    edges = new Map()
    edgcount = 0
    selectedNode = null;
    selectedEdge = null;
    nodeCount = 1;
    updateVertexCount(); 
    updateEdgeCount();
    redraw();
  }


function updateVertexCount() {
    document.getElementById('vertex-count').innerText = `Número de Vértices: ${nodes.length}`;
  }

function updateEdgeCount(){
    document.getElementById('edge-count').innerText = `Número de Arestas: ${edgcount}`;
}


function nodeRemove(){
  if(selectedNode){
    edges.delete(selectedNode)
    for([node1, no] of edges){
      edges.set(node1,no.filter(n => n[0] != selectedNode))
    }
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
    edgcount++;
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
  document.getElementById('vizinhoMaisProximo').addEventListener('click', vizinhoMaisProximo);
}


function pesoPopup() {
    popup.style.display = "flex";
    clicky = false;
    activePopup = true;
    
}

// Function to hide the popup
function hidePopup() {
    popup.style.display = "none";
    clicky = true;
    activePopup=false;
}

window.addEventListener("click", function (event) {
  if (event.target === popup) {
      hidePopup();
  }
});

function orderArestas(){
  for( let [node,no] of edges){
    edges.get(node).sort((a,b) => a[1] - b[1]);
  }
}

function vizinhoMaisProximo(){
  if(selectedNode != null){  
    orderArestas();
    let peso = 0;
    caminho = [];
    caminho.push(selectedNode);
    let nodeChoice = [-1];
    let currentChoice;
    let currentNode;
    let currentEdges = [];
    let i;
    let done = false;
    let aux;

    arestasPercorridas.length = 0;
    while(caminho.length != 0){
      console.log(nodeChoice);
      currentNode = caminho.at(-1);
      currentChoice = nodeChoice.pop()+1;
      currentEdges = edges.get(currentNode);
      if(caminho.length == nodes.length && currentEdges.some(edge => edge[0] == selectedNode)) break;
      for(i=currentChoice; i<currentEdges.length && caminho.includes(currentEdges[i][0]); i++);
      if(i==currentEdges.length) {
        caminho.pop();
        if (arestasPercorridas.length > 0) arestasPercorridas.pop();  
      }
      else{
        nodeChoice.push(i);
        nodeChoice.push(-1);
        caminho.push(currentEdges[i][0]);
        peso += currentEdges[i][1];
        arestasPercorridas.push([currentNode.name, currentEdges[i][0].name]);
        console.log("Arestas percorridas:", arestasPercorridas);
      }
      console.log(currentNode);
      console.log(i);
    }
    arestasPercorridas.push([caminho[caminho.length - 1].name, caminho[0].name]);
    console.log("Arestas Percorridas:" , arestasPercorridas);
    console.log(currentEdges);
    for( let c of caminho){
      console.log(c.name);
    }
    selectedNode = null;

    redraw(); 
    return peso;
  }
}





 