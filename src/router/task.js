const express = require('express')
const Tasks = require('../model/task')
const router = express.Router()
const  auth = require('../middleware/auth')
router.post('/task',auth, async (req, res) => {
    // const task = new Tasks(req.body)
    const task =new Tasks({
        ...req.body,
        owner:req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})


router.get('/tasks',auth, async (req, res) => {
    try {
        const tasks = await Tasks.find({owner:req.user.id})
        res.status(200).send(tasks)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/task/:id',auth, async (req, res) => {
    try {
        // const task = await Tasks.findById(req.params.id)
        const  task=await Tasks.findOne({_id:req.params.id,owner:req.user._id})
        if (!task) {
            return res.status(404).send()
        }
        res.status(200).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})


router.patch('/task/:id',auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowtoupdate = ['description', 'completed'];

    const ismatch = updates.every(update => allowtoupdate.includes(update))
    if (!ismatch) {
        return res.status(500).send('invalid request')
    }
    try {
        const task =await Tasks.findOne({_id:req.params.id,owner:req.user._id})
        
        // const task = await Tasks.findByIdAndUpdate(req.params.id, req.body, {
        //     new: true,
        //     runValidators: true
        // })

        if (!task) {
            return res.status(404).send()
        }
        updates.forEach(updates => task[updates] = req.body[updates])
        await task.save();
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})


router.delete('/task/:id',auth, async (req, res) => {
    try {
        const task = await Tasks.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        if (!task) {
            return res.status(404).send('not found')
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})


module.exports=router