onload = function () {
    // create a network
    var curr_data;
    var sz;
    var container = document.getElementById('mynetwork');
    var container2 = document.getElementById('mynetwork2');
    var genNew = document.getElementById('generate-graph');
    var solve = document.getElementById('solve');
    var temptext = document.getElementById('temptext');
    var temptext2 = document.getElementById('temptext2');
    // initialise styling options
    var options = {
        edges: {
            labelHighlightBold: true,
            font: {
                size: 20
            }
        },
        nodes: {
            font: '12px arial red',
            scaling: {
                label: true
            },
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf207',
                size: 40,
                color: '#800000',
            }
        }
    };
    // initialize your network
    var network = new vis.Network(container);
    network.setOptions(options);
    var network2 = new vis.Network(container2);
    network2.setOptions(options);
    const cities = ['Delhi', 'Mumbai','Amritsar','Guwahati','Bhubaneswar','Gaya','Port Blair','Ahmedabad','Jaipur','Mangalore','Kochi','Kozhikode','Thiruvananthapuram', 'Goa', 'Kanpur', 'Jammu', 'Hyderabad', 'Bangalore', 'Gangtok', 'Meghalaya','Bhopal','Lucknow'];

    sz = cities.length;
    src = parseInt(document.getElementById('departure').value);
    dst = parseInt(document.getElementById('arrival').value);

    //to set data to some random values 
    function createData(){

        let nodes = [];
        for(let i=1;i<=sz;i++){
            nodes.push({id:i, label: cities[i-1]})
        }
        nodes = new vis.DataSet(nodes);
        //console.log(nodes);

        //edge initialisation... its random
        let edges = [];
        for(let i=2;i<=sz;i++){
            let neigh = i - Math.floor(Math.random()*Math.min(i-1,3)+1);  // i-{1,2,3}
            edges.push({
                type: 0, 
                from: i, 
                to: neigh, 
                color: 'orange',
                label: String(Math.floor(Math.random()*70)+31)
            });
        }

        //use of forloop is to insert more edges
        for(let i=1;i<=sz/2;){
            //select any two random vertices(cities)
            let n1 = Math.floor(Math.random()*sz)+1;  
            let n2 = Math.floor(Math.random()*sz)+1; 
            //both of them should not be same and n1 should be greater than n2
            if(n1!=n2)
            {
                if(n1<n2)
                {
                    let tmp = n1;
                    n1 = n2;
                    n2 = tmp;
                }
                let works = 0;
                for(let j=0;j<edges.length;j++)
                {
                    if(edges[j]['from']===n1 && edges[j]['to']===n2) 
                        works = 1;
                }

                if (works === 0 && i < sz / 4) {
                    edges.push({
                        type: 0,
                        from: n1,
                        to: n2,
                        color: 'orange',
                        label: String(Math.floor(Math.random() * 70) + 31)
                    });
                }
                i++; //increment only if n1 != n2 and works <= 1
            }
        }

        //data initialization
        let data = {
            nodes: nodes,
            edges: edges
        };
        curr_data = data;
    }

    //to generate new path with new time (graph)
    genNew.onclick = function () {
        createData();
        //console.log(curr_data);
        network.setData(curr_data);
        temptext.style.display = "inline";
        temptext2.style.display = "inline";
        container2.style.display = "none";
    };

    var modal = document.getElementById("myModal");
    var span = document.getElementsByClassName("close")[0];

    //to generate solution of the given problem
    solve.onclick = function () {
        temptext.style.display  = "none";
        temptext2.style.display  = "none";
        container2.style.display = "inline";
        //console.log(curr_data);
        solution = solveData(sz);
        network2.setData(solution.data);
        stod = document.getElementById("stod");
        stod.innerText = cities[src-1]+' to '+cities[dst-1];
        esttime = document.getElementById("esttime");
        console.log(solution.totaltime);
        esttime.innerText = solution.totaltime;
        modal.style.display = "block";
    };

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
          modal.style.display = "none";
        }
      }


    //the main function
    function dijkstra(graph, sz, src) {
        let vis = Array(sz).fill(0);   //visited elements array
        let dist = [];
        
        for(let i=1;i<=sz;i++)
            dist.push([10000,-1]); //passing a huge value // and unvisited (otherwise parent)

        dist[src][0] = 0;           //source distance = 0

        for(let i=0;i<sz-1;i++)
        {
            let mn = -1;

            //to select the path with least time
            for(let j=0;j<sz;j++){
                if(vis[j]===0)
                {
                    if(mn===-1 || dist[j][0]<dist[mn][0])
                        mn = j;
                }
            }

            vis[mn] = 1;  //mark it as visited

            //relaxation logic
            for(let j in graph[mn]){
                let edge = graph[mn][j];
                if(vis[edge[0]]===0 && dist[edge[0]][0]>dist[mn][0]+edge[1])
                {
                    dist[edge[0]][0] = dist[mn][0]+edge[1];     //set the new time 
                    dist[edge[0]][1] = mn;                      //set it as parent
                }
            }
        }
        //returns array of time
        return dist;
    }


    function solveData(sz) {
        src = parseInt(document.getElementById('departure').value);
        dst = parseInt(document.getElementById('arrival').value);
    
        let data = curr_data;
        let graph = [];
        
        //initialize a 2d array 
        for(let i=1;i<=sz;i++){
            graph.push([]);
        }

        //loop over total edges
        for(let i=0;i<data['edges'].length;i++) {
            let edge = data['edges'][i];
            //since it is an undirected graph
            graph[edge['to']-1].push([edge['from']-1,parseInt(edge['label'])]);
            graph[edge['from']-1].push([edge['to']-1,parseInt(edge['label'])]);
        }

        let dist1 = dijkstra(graph,sz,src-1);

        let mn_dist = dist1[dst-1][0];  //to get final destination distance 
        new_edges = [];
        pushEdges(dist1, dst-1);
        data = {
            nodes: data['nodes'],
            edges: new_edges
        };
        return {data:data,totaltime:dist1[dst-1][0]};
    }

    function pushEdges(dist, curr) {

        while(dist[curr][0]!=0){
            let fm = dist[curr][1];
            new_edges.push({arrows: { to: { enabled: true}},from: fm+1, to: curr+1, color: 'green', label: String(dist[curr][0] - dist[fm][0])});
            curr = fm;
        }
    }

    genNew.click();
};

