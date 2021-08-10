---
  slug: "/posts/an-easy-way-to-try-vonage-communication-api-locally/"
  date: 2021-08-08
  title: "An easy way to try Vonage Communication API locally"
  draft: false
  description: "Our product is often involving real time communication, so is a bidirectional communication. Is making easy to do very complicated stuff like managing phone call, audio, sms, IM messages (whatsapp…"
  categories: []
  keywords: []
---
  
I work at Vonage , in the API department.

Our product is often involving real time communication, so is a bidirectional communication. Is making easy to do very complicated stuff like managing phone call, audio, sms, IM messages (whatsapp, facebook, etc..) and much more.

It’s “easy” but not trivial, and the initial configuration and setup can be still pretty tricky for new developers.

That’s why I’ve created this internal tool [https://github.com/jurgob/conversation-api-function](https://github.com/jurgob/conversation-api-function)

In this article I m gonna explain why I did this and what the tool is doing for you, but first I suggest you do the following:

go to the link above, follow the instruction, call your Vonage phone number (you will have one after you follow the tutorial) and hear a computer voice telling you “hello world”. I bet you are gonna do everything in less then 20 minutes!. That’s just to keep you exited! If you have some more time, look also the `Examples` list to see how many thing you can do.

### **What the tool is doing for me? the short version**

This tools require just some minimal configuration once, then you will be able to develop and execute those javascript example, that from now on I’m gonna call _conversation function,_ in a super easy way, and they are gonna be testable in your local machine!.

You want to share an example with someone else? just publish it on Github, if another person want to test it, he can just download it, eventually run \`npm install\` and run the example. You are gonna run the same code, but you will not share any data or information!.

You may already have everything you need at this point, and you may prefer digging into the examples rather then reading the rest of the article. It’s fine! do it! Possibly have fun and create a new example of a use case I still didn’t think about, I accept pull requests in the read me!

### **What the tool is doing for me?**

**note:** again, you can use the tool without really knowing all of the following, but is gonna help you in a deeper understanding of the tool and the vonage api itsefls.

In general, when you use our api, you need to do the following steps:

1.  The very first time, you need to create an account (e.g. My Company)
2.  once you’ve got an account, (with the related api\_key and api\_secret), you need to create an application (e.g: My Chat Application or My Telephony Support System)
3.  Once you create an application you get a private key, you need that to generate a JWT token.
4.  If you want to program an incoming call or incoming facebook message(e.g. you want to say “hello” to everyone calling you), you need to have Vonage phone number (so called LVN, Long Virtual Number) , and you need to bind it to your application. Also, you need to configure a set of webhook urls with your back end url in order to be notified about something happend in your application (e.g. someone is calling your lvn number)
5.  if you are implementing the use case in the step 4 and you want to test it locally, then you have to expose your laptop with some tool like [localtunnel](https://github.com/localtunnel/localtunnel) or [ngrok](https://ngrok.com/) and then update your application’s webhook in order to reach your laptop.

**conversation-api-functions** is gonna to the step 1/2/3 once you run the `fist_config` command. Every time you use `run` to run your node function, is gonna do the step 4 and 5.

As soon as the `first_config` is creating a new [Vonage application](https://developer.nexmo.com/application/overview), this app is gonna be used for every conversation function you are gonna run in your laptop, and every device where you are gonna run that is gonna use a different application. That’s why if someone else is using your code, the data are not gonna be shared anyhow.

### The anatomy of a conversation function

In the creation of this tool, I got inspired a lot from tools like [aws lamda function](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) , [aws SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) and [Jamstack technologies](https://jamstack.org/) and in particular [Vercel](https://vercel.com/).

All those things strive to let you focus only on what you are doing, without the need to be worried about details like “coding my infrastracture” or “addin a cdn in fron of my application” or “configure webpack to split my javascript code per page”. Those are concepts that you may ignore your all life and still be very successful in writing next.js app in vercel or lamnda functions in aws SAM.

in the same way, all you need to do when you write a conversation function, is to write an `index.js` file where you export a js module which export certain methods.

what those methods do, are document [here](https://github.com/jurgob/conversation-api-function/blob/main/template/index.js).

you may notice that excluding the handler `route`that is a bit of an exception, every other handler has a 1:1 relationship with the webhook capatilities you can configure in your application. Check the **Webhook types** section in this link: [https://developer.nexmo.com/application/overview](https://developer.nexmo.com/application/overview), you will notice as instance the first row is `voice` and `answer_url` .   
In the cli you just need to implement the `voiceAnswer` handler, which is an express middleware.

As you can see you don’t need to be concerned on the part where you configure/update your vonage app, or even spin up your express server.

### In Conclusion

I’ve briefly introduced this new internal tool to quickly use the Vonage Comunication API, if you have reached this part of the article, probably you now have a working example in your laptop and you’ve learn some notion about the Vonage API echo system. Your next step should now go in the Examples section here: [https://github.com/jurgob/conversation-api-function#examples](https://github.com/jurgob/conversation-api-function#examples) and see how many crazy things you can do!
  