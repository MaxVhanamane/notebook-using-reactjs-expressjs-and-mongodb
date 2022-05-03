const express = require("express");
const router = express.Router();
const { body, validationResult } = require('express-validator');
const fetchUser = require("../middleware/fetchuser")
const Note = require("../modules/notes")

// Route to add Notes
router.post("/addnote",      
// Validating a user input using express-validator. 
    [body('title', "description must be atleast 1 characters long").isLength({ min: 1 }),
    body('description', "description must be atleast 2 characters long").isLength({ min: 2 })],

    fetchUser,

    async (req, res) => {

        // const errors = validationResult(req) line of code is from express-validator module. which will give us an error as a object when 
        // validation fails.
        const errors = validationResult(req);
        // If there are errors in validation then return the bad request
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, tag } = req.body
        try {
          
        // To add items in database you can use either .create() or .save() both of them work fine.

        // First method :
            // newNote = await Note.create({
            //     title: title,
            //     description: description,
            //     tag: tag,
            //     user: req.user.id
            // });
            // res.json(newNote)
        // Second method :
            newNote=  new Note({
                title: title,
                description: description,
                tag: tag,
                user: req.user.id   // Here user will act as foreign key. because we have defined it as foreign key in notes Schema. 
                                    // req.user.id we receive this from fetchUser middleware.           
            })
            const savedNote= await newNote.save()

            res.json(savedNote)


        } catch (err) {
            res.status(500).send("Internal server error")
        }
    }

)

// Route to get notes
router.get("/fetchallnotes", fetchUser, async (req, res) => {
    try {
        // req.user.id we receive this from fetchUser middleware. we will get all the notes of user whose user id is equal to req.user.id.
        const allNotes = await Note.find({ user: req.user.id })
        res.json(allNotes)
    } catch (err) {
        res.status(500).send("Internal server error")
    }

})

// Route to update notes

router.put("/updatenote/:id",fetchUser,async(req,res)=>{
const {title,description,tag}=req.body;

const newNoteValue={};

if(title){newNoteValue.title=title}
if(title){newNoteValue.description=description}
if(title){newNoteValue.tag=tag}
// console.log("newNoteValue",newNoteValue)
try {
    

const note = await Note.findById(req.params.id);


console.log("note",note)

if(!note){return res.status(404).send("Not Found")}

console.log("note.user",note.user)
console.log(typeof(note.user))


if(note.user.toString() !== req.user.id){
return res.status(401).send("Not Allowed")
}
// const updatedNote=  Note.findByIdAndUpdate(req.params.id,{$set:newNoteValue},(err, obj) => {
//     if (err) {
//         res.send(err);
//     }
//     else {
//        res.send(obj);

//     }})
const updatedNote= await Note.findByIdAndUpdate(req.params.id,{$set:newNoteValue},{new:true})
res.send(updatedNote)
} catch (err) {
    res.status(500).send("Internal server error")
}
})

router.delete("/deletenote/:id",fetchUser,async(req,res)=>{

    try {
    

        const note = await Note.findById(req.params.id);
        
        if(!note){return res.status(404).send("Not Found")}
    
        if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed")
        }

        await Note.findByIdAndDelete(req.params.id)
        res.send({"Success":"Note has been deleted successfully"})
        } catch (err) {
            res.status(500).send("Internal server error")
        }

})


module.exports = router
