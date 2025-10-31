import { Router } from "express";
import { chatSchema, Message, Role, userSchema } from "../types";
import { sendMessage } from "../utils/openRouter";
import { randomUUID } from "crypto";
import { InMemoryStore } from "../inMemory";
import { authMiddleware } from "../middleware/auth-middleware";
import { PrismaClient } from "@prisma/client";
const router = Router();

const prisma = new PrismaClient();

router.get('/conversations', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const conversations = await prisma.conversation.findMany({
    where: {
      userId
    }
  })
  res.json({
    conversations
  })
})

router.get('/conversations/:conversationId', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const conversationId = req.params.conversationId;

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
      userId
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  })
  res.json({
    conversation
  });
})

router.post("/chat", authMiddleware, async (req, res)=> {
    const userId = req.userId;
    const {success, data} = chatSchema.safeParse(req.body);
    if(!success) {
        res.status(411).send("Invalid Input");
    }

    let conversationId = data?.conversationId;
    if(!conversationId) {
      conversationId = randomUUID();
    }

    let existingMessage: Message[] = InMemoryStore.getInstance().get(conversationId);

    try {
      if(!data?.model) {
        res.status(411).send('The model is required');
        return;
      }
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();
      let message = "";
      await sendMessage(data?.model, [...existingMessage, {
        role: Role.User,
        content: data.message
      }], (chunk: string)=> {
        message += chunk;
        res.write(chunk);
      });
      res.end();
      InMemoryStore.getInstance().add(conversationId, {
        role: Role.User,
        content: data.message
      })

      InMemoryStore.getInstance().add(conversationId, {
        role: Role.Agent,
        content: message
      })
      // Save to database

      if(!data.conversationId) {
        if (!userId) {
          res.status(401).send('User not authenticated');
          return;
        }
        await prisma.conversation.create({
          data: {
            userId,
            title: data.message.substring(0, 20) + '...',
            id: conversationId
          }
        })
      }
        await prisma.message.createMany({
          data: [
            {
              conversationId,
              content: data.message,
              role: Role.User
            },
            {
              conversationId,
              content: message,
              role: Role.Agent,
            },
          ]
        })
      
      
    } catch (error) {
      res.status(500).send(`Internal server error: ${error}`);
      console.error(error);
    }

})
export default router;