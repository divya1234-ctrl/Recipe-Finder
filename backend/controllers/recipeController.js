import Groq from "groq-sdk"

export const generateRecipe = async(req,res) =>{
    try{
      const {ingredients} = req.body;

      if(!ingredients){
        return res.status(400).json({error:"Ingredients required"})
      }
      
      const groq = new Groq({
        apiKey:process.env.GROQ_API_KEY
      });
      
      //completions means AI generated ans
      const completion = await groq.chat.completions.create({
           model:"llama-3.1-8b-instant",
           messages:
           [{
            role:"user",
            content:`Create a simple recipe using ${ingredients}`
           }
           ]
      })

      res.json({
        recipe: completion.choices[0].message.content,
        source: "Groq AI (LLaMA 3.1)"
      })

    }catch(error){
        res.status(500).json({
            error:"AI generation failed",
            details:error.message
        })
    }
}