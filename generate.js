export default async function handler(req,res){
 res.setHeader("Cache-Control","no-store");
 if(req.method!=="POST")return res.status(405).json({error:"Use POST."});
 if(!process.env.FAL_KEY)return res.status(500).json({error:"FAL_KEY is missing in Vercel Environment Variables."});
 const model="fal-ai/wan/v2.7/text-to-video",auth={Authorization:`Key ${process.env.FAL_KEY}`,"Content-Type":"application/json"};
 try{
  const body=req.body||{};
  if(body.action==="submit"){
   const prompt=String(body.prompt||"").trim();
   if(!prompt)return res.status(400).json({error:"Please enter a prompt."});
   const ratios=["16:9","9:16","1:1"],resolutions=["720p","1080p"];
   const payload={prompt,aspect_ratio:ratios.includes(body.aspectRatio)?body.aspectRatio:"9:16",resolution:resolutions.includes(body.quality)?body.quality:"720p",duration:Math.max(2,Math.min(15,Number(body.duration)||5)),enable_prompt_expansion:true,enable_safety_checker:true};
   const r=await fetch(`https://queue.fal.run/${model}`,{method:"POST",headers:auth,body:JSON.stringify(payload)}),d=await r.json().catch(()=>({}));
   if(!r.ok)return res.status(r.status).json({error:d.detail||d.error||"fal.ai could not accept the request."});
   return res.status(200).json({request_id:d.request_id});
  }
  if(body.action==="status"){
   const id=String(body.request_id||"");
   if(!/^[a-zA-Z0-9-]+$/.test(id))return res.status(400).json({error:"Invalid request ID."});
   const base=`https://queue.fal.run/${model}/requests/${id}`;
   const sr=await fetch(`${base}/status`,{headers:{Authorization:auth.Authorization}}),sd=await sr.json().catch(()=>({}));
   if(!sr.ok)return res.status(sr.status).json({error:sd.detail||sd.error||"Could not read status."});
   const status=String(sd.status||"IN_QUEUE").toUpperCase();
   if(status!=="COMPLETED"){
    if(status==="FAILED"||status==="CANCELLED")return res.status(200).json({status,error:"fal.ai reported generation failed."});
    return res.status(200).json({status});
   }
   const rr=await fetch(base,{headers:{Authorization:auth.Authorization}}),rd=await rr.json().catch(()=>({}));
   if(!rr.ok)return res.status(rr.status).json({error:rd.detail||rd.error||"Could not retrieve video."});
   if(!rd.video||!rd.video.url)return res.status(502).json({error:"fal.ai returned no video URL."});
   return res.status(200).json({status:"COMPLETED",videoUrl:rd.video.url});
  }
  return res.status(400).json({error:"Unknown action."});
 }catch(e){return res.status(500).json({error:"Server error contacting fal.ai. Please try again."});}
}
