export default {
  async fetch(request){
    if(request.method!=='POST') return new Response('CHECK API OK');
    const formData=await request.formData();
    const ccdata=formData.get('ccdata')||'';
    return await processCCs(ccdata,false); // false = check only
  }
};
