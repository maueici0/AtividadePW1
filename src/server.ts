import { randomUUID } from "crypto";
import express, { Request, Response, NextFunction } from "express";

export type Technology = {
    id: string;
    title: string;
    studied: boolean;
    deadline: Date;
    created_at: Date;
};

export type User = {
    id: string;
    name: string;
    username: string;
    technologies: Technology[];
};

const users: User[] = [];

const app = express();
app.use(express.json());

// Middleware
function checkExistsUserAccount(req: Request, res: Response, next: NextFunction) {

    const user = users.find(element => element.username == req.headers['username']);
    if (!user) {
        return res.status(404).json({ "error": "User doesn't exists" });
    }
    req.user = user;
    return next();
}

// Rotas User

app.post('/users', (req: Request, res: Response) => {

    const { name, username } = req.body;

    if (users.find(user => user.username == username)) {
        return res.status(400).json({ error: "User already exists" });
    }

    const newUser: User = {
        id: randomUUID(),
        name,
        username,
        technologies: []
    }

    users.push(newUser);
    return res.status(201).json({ newUser });

});

// Rotas Technologies

app.get('/technologies', checkExistsUserAccount, (req: Request, res: Response) => {

    return res.status(200).json(req.user.technologies);

});

app.post('/technologies', checkExistsUserAccount, (req: Request, res: Response) => {

    const { title, deadline } = req.body;

    const newTechnology: Technology = {
        id: randomUUID(),
        title,
        studied: false,
        deadline: new Date(deadline),
        created_at: new Date()
    }

    req.user.technologies.push(newTechnology);

    return res.status(201).json({ newTechnology });

});

app.put('/technologies/:id', checkExistsUserAccount, (req: Request, res: Response) => {

    const { id } = req.params;
    const user = req.user;
    const userTechnology = user.technologies.find(element => element.id == id);
    if (!userTechnology) {
        return res.status(404).json({ error: "Technology not found" })
    }

    const { title, deadline } = req.body;
    userTechnology.title = title;
    userTechnology.deadline = deadline;

    return res.status(200).json(userTechnology);

});

app.patch('/technologies/:id/studied', checkExistsUserAccount, (req: Request, res: Response) => {

    const { id } = req.params;
    const user = req.user;
    const userTechnology = user.technologies.find(element => element.id == id);
    if (!userTechnology) {
        return res.status(404).json({ error: "Technology not found" })
    }
    userTechnology.studied = true;
    return res.status(200).json(userTechnology);

});

app.delete('/technologies/:id', checkExistsUserAccount, (req: Request, res: Response) => {

    const { id } = req.params;
    const user = req.user;
    const userTechnologyIndex = user.technologies.findIndex(element => element.id == id);
    if (userTechnologyIndex===-1) {
        return res.status(404).json({ error: "Technology not found" })
    }

    user.technologies.splice(userTechnologyIndex, 1);

    return res.status(200).json({ message: "Technology removed" });

});

app.listen(3000, () => { console.log('Aplicação rodando na porta 3000'); })