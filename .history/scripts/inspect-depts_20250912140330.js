(async()=>{
  try{
    const listRes=await fetch('http://localhost:3000/api/department');
    const listText=await listRes.text();
    console.log('\n--- LIST STATUS',listRes.status,'---');
    console.log(listText);
    let json=null; try{json=JSON.parse(listText)}catch(e){}
    const arr=Array.isArray(json)?json:(json?.data||json||[]);
    const names=['Safety','Maintenance'];
    for(const n of names){
      const match=arr.find(d=>((d.departmentName||d.DepartmentName||d.name||d.Name||'').toString().toLowerCase())===n.toLowerCase());
      console.log('\n--- MATCH FOR',n,'->',match?JSON.stringify(match):'NOT FOUND');
      if(match){
        const id=match.departmentID ?? match.DepartmentID ?? match.id ?? match.departmentId;
        if(id){
          const r=await fetch('http://localhost:3000/api/department/'+id);
          const t=await r.text();
          console.log('\n--- GET ID',id,'status',r.status);
          console.log(t);
        }
      }
    }
  }catch(e){console.error(e);} 
})()
