
//let num12=Number(prompt("Enter number 12"));
//let num13=Number(prompt("Enyter number 13"));
//console.log("Addition:"+(num12+num13)+
//"\nSubtraction:"+(num12-num13)+
//"\nMutiplication:"+(num12*num13)+
//"\nDivision:"+(num12/num13)+
//"\nPersontage:"+(num12%num13));

//let name=prompt("Enter your name");
//alert("Well Come");

let weather=prompt("Enter weather")
if(weather=="rainy"){
    alert("Bring your umbrella")
}
else{
   alert("Enjoy your day")
}

let time=new Date().toLocaleDateString('en-us',{weekday:'short'});//.getMinutes();
alert(time)
if(time<12){
    alert("Good Morning")
}
else{
    alert("Good Afternoon")
}



