var fs = require('fs');
var readline = require('readline');
var stream = require('stream');

var rl = readline.createInterface({
    input : require('fs').createReadStream("csv/WDI_Data.csv")
});

var heading = new Array();
var gdpIndiaGrowth=[];
var gdp = new Array();
var gni = new Array();
var gdpPerCapita = new Array();
var gniPerCapita = new Array();
var gdpaggcontinent=[];

var continents = JSON.parse(fs.readFileSync("json/continents.json", "utf-8"));

var countries= JSON.parse(fs.readFileSync("json/countries.json", "utf-8"));

var aggregate_continents = {};


aggregate_continents["AFRICA"] =[];
aggregate_continents["ASIA"] = [];
aggregate_continents["N_AMERICA"]= [];
aggregate_continents["S_AMERICA"]= [],
aggregate_continents["EUROPE"]=[];
aggregate_continents["AUSTRALIA"]=[];


for (i=0;i<56;i++){

  aggregate_continents["ASIA"][i]=0.0;
  aggregate_continents["AFRICA"][i]=0.0;
  aggregate_continents["EUROPE"][i]=0.0;
  aggregate_continents["N_AMERICA"][i]=0.0;
  aggregate_continents["S_AMERICA"][i]=0.0;
  aggregate_continents["AUSTRALIA"][i]=0.0;
}
rl.on('line', function(line) {

  var currentLine = line.split(",");
  var lineLength = currentLine.length;
  
  if(currentLine[0]=="Country Name")
  {
    header=currentLine;
  }
  else {

    if(countries.indexOf(currentLine[0]) > -1 ) {

        switch(currentLine[2]) {
          case "GDP (constant 2005 US$)":
            gdp[currentLine[0]] = parseFloat(currentLine[49]);
          break;
          case "GNI (constant 2005 US$)":
            gni[currentLine[0]] = parseFloat(currentLine[49]);
          break;
          case "GDP per capita (constant 2005 US$)":
            gdpPerCapita[currentLine[0]] = parseFloat(currentLine[49]);
          break;
          case "GNI per capita (constant 2005 US$)":
            gniPerCapita[currentLine[0]] = parseFloat(currentLine[49]);
          break;
        }
    }

    if (currentLine[0]==="India" && currentLine[2]==="GDP growth (annual %)" )
    {
      for (var i = 4; i <= 59; i++)
      {
        if(!isNaN(parseFloat(currentLine[i])))
        {
          var gdpIndia={};
          gdpIndia.year  = header[i];
          gdpIndia.gdp = currentLine[i];
          gdpIndiaGrowth.push(gdpIndia);
        }
      }
    }


  if(currentLine[2]== "GDP per capita (constant 2005 US$)")
  {
    for(i=4;i<currentLine.length;i++){
                if(aggregate_continents[continents[currentLine[0]]]!=undefined && !isNaN(parseFloat(currentLine[i])))
                aggregate_continents[continents[currentLine[0]]][i-4]=aggregate_continents[continents[currentLine[0]]][i-4]+parseFloat(currentLine[i]);
    }

  }
}
});

rl.on('close', function(){

  var gdpgnisorted = new Array();
  var sortedArray = new Array();
  for(key in gdp) {
   var temp = new Object();
   temp["key"] = key;
   temp["value"] = gdp[key];
   sortedArray.push(temp);
  }

  sortedArray.sort(function(a,b){return (b.value-a.value)});

  for(var i = 0; i<15; i++)
  {
   var gdpnext = new Object();
   gdpnext["Country"]=sortedArray[i].key;
   gdpnext["GDP"]=sortedArray[i].value;
   gdpnext["GNI"]=gni[sortedArray[i].key];
   gdpgnisorted.push(gdpnext);
  }
  fs.writeFile('json/gdpgnisorted.json',JSON.stringify(gdpgnisorted,null,4),function(err){
   if(err){
     console.error(err);
   }
 });

  var gdpcgnicsorted = new Array();
  var sortedArray = new Array();
  for(key in gdpPerCapita)
  {
    var temp = new Object();
    temp["key"] = key;
    temp["value"] = gdpPerCapita[key];
    sortedArray.push(temp);
  }

  sortedArray.sort(function(a,b){return (b.value-a.value)});

  for(var i = 0; i<15; i++)
  {
    var temp = new Object();
    temp["Country"]=sortedArray[i].key;
    temp["GDPPC"]=sortedArray[i].value;
    temp["GNIPC"]=gniPerCapita[sortedArray[i].key];
    gdpcgnicsorted.push(temp);
  }

  fs.writeFile('json/gdpcgnicsorted.json',JSON.stringify(gdpcgnicsorted,null,4),function(err){
    if(err){
      console.error(err);
    }
  });

  fs.writeFile('json/gdpIndiaGrowth.json',JSON.stringify(gdpIndiaGrowth,null,4),function(err){
    if(err){
      console.error(err);
    }
  });

  for(i=4;i<60;i++){
      aggcontinent= new Object();
      aggcontinent["Year"]=header[i];
      aggcontinent["ASIA"]=aggregate_continents["ASIA"][i-4];
      aggcontinent["AFRICA"]=aggregate_continents["AFRICA"][i-4];
      aggcontinent["EUROPE"]=aggregate_continents["EUROPE"][i-4];
      aggcontinent["N_AMERICA"]=aggregate_continents["N_AMERICA"][i-4];
      aggcontinent["S_AMERICA"]=aggregate_continents["S_AMERICA"][i-4];
      aggcontinent["AUSTRALIA"]=aggregate_continents["AUSTRALIA"][i-4];
      gdpaggcontinent.push(aggcontinent)
    }
    fs.writeFile('json/gdpaggcontinent.json',JSON.stringify(gdpaggcontinent,null,4),function(err){
      if(err){
        console.error(err);
      }
    });

});
