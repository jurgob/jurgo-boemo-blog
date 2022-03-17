---
  slug: "/posts/an-easy-way-to-try-vonage-communication-api-locally/"
  date: 2021-08-08 16:37
  title: "An easy way to try Vonage Communication API locally"
  draft: false
  description: "Our product is often involving real time communication, so is a bidirectional communication. Is making easy to do very complicated stuff like managing phone call, audio, sms, IM messages (whatsapp…"
  categories: []
  keywords: []
---
  
I work at Vonage , in the API department.

In there we do something called "Comunication API". 
That's a set of apis that allows you to do stuff like sending / receiving , SMS, phone calls, create video, audio and text chat and so on. You can also do crasy stuff like make someone calling a phone number talking with someone connecting from his browser.

In this article I m gonna talk about a cli tool to quickly create prototypes app using those apis. 

If I got your attention and your trust and you just want a quick install it and start to play, go here: [https://github.com/jurgob/conversation-api-function](https://github.com/jurgob/conversation-api-function) and follow the instructions. I estimate than in less then 20 min (10 if you are a node developer) you will have a working app. 
If you have some more time, look also the `Examples` list to see how many thing you can do.
You can stop reading this if you were seaching for a quick install guide :)

If you want to know more, about the why and the what of this tool, keep reading. 

### ***The Vonage configuration API fatigue***

To test our comunication API, you need to set up several things. let's say you want to test how you can receive a voice call and say some text, and you want to do it locally. what you need to do is the following:

1. register to nexmo and buy an LVN
2. create an application
3. configure your number to be connected to your application
4. your "backend" is in your local machine as far as you are developing, so you need to expose is somehow with tools like localtunnel.
5. configure your application to hit your public locatunnel address, so you can receive in your local application the vonage events.

after you do this, you can test a scenare where you reciave a PHONE call. 
Let's say you want to try a PHONE to BROWSER scenario. That means you have to add the following steps: 

6. setup some frontend
7. configure our sdk in your frontend
8. typically set up some db for storing some state of your business app. 

Those steps are “easy” but not a little time consuming, and the initial configuration and setup can be still pretty tricky for new developers.

Simplify this is the main reason I wrote this tool.


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
  