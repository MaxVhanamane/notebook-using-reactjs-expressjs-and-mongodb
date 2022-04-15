const mongoose=require("mongoose")

const notesSchema = new mongoose.Schema({
  user:{type: mongoose.Schema.Types.ObjectId, 
        ref: 'Users'},
    title: { type: String,required:true },
    description: { type: String,requiered:true},
    tag: { type: String,default:"General" },
    }
  );
 module.exports = mongoose.model('Note', notesSchema);
