---
  slug: "/posts/an_interactive_way_to_learn_javascript_jsquest/"
  date: 2022-04-01 22:19
  title: "My journey in the React world"
  draft: true
  description: "I'm gonna share my path towards discovering and understending react"
  categories: []
  keywords: []
---


#### Why I'm writing this

In this article I'm gonna tell you how I've discovered React. It was an exciting journey, becouse At the first I didn't get react, then I started to understand a series of concept that made me a better developer overall, not only a better js / frontend guy. 

#### Who am I

I started my careed in my own start up doing [Google GWT](http://www.gwtproject.org/), then for 4 years I did mobile websites targetting even very old mobile phones thus having an interface working without JS was a must. In this period I also did a geolocated chat using Angular.js as a freelancer. 

Then I change my job and for 2 years I worked with mustache and React.

Then 5 years ago I change completly my career and I became a backend developer, since then I follow react as an hobbist and I use it mainly for doing small POC around our APIs. 

#### Who should read this? 

Any JS developer could read this, but I feel that someone who is not familiar with  React and its ecosystem would just be a little overwhealmed by the ammount of things I'm talking about and would not benefit too much with this.

#### Why you should read this

By telling you my story I would like you to understand that getting a new framework takes time, you don't get it all in 5 min (or at least I don't). 

By giving some "historical" context of how was the frontend world when React came out, I hope to highlinght why React was a big thing back then. 

In the end I hope I will give a brief reacap of all the main React concepts toghether with a list of must see video / must read articles. 
Is not gonna be a short read, but if you care only about the Design concepts I m talking, just click on the following list of links: 

- [Pete Hunt: React: Rethinking best practices -- JSConf EU](https://www.youtube.com/watch?v=x7cQ3mrcKaY) 
- [Jin Chen: Talking about Flux](https://www.youtube.com/watch?v=nYkdrAPrdcw&t=632s)
- [Isomorpchic Javascript](https://en.wikipedia.org/wiki/Isomorphic_JavaScript)
- [Dan Abramov presenting redux](https://www.youtube.com/watch?v=xsSnOQynTHs)
- [Presentational and Container Components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0#:~:text=While%20container%20components%20tend%20to,as%20classes%20and%20as%20functions.)
- [How to write Component that do logic](https://www.youtube.com/watch?v=kp-NOggyz54)
Also keep in mind, this is not a React developer guide, there are a lot of better articles and guided for that, starting with the amazing [Official React Documentation](https://reactjs.org/docs/getting-started.html)


#### The Journey ####

##### Part 1: Adopting React

The first part of my react journey is obviously how I decided to use it. 

I start my fist job in London as a frontend developer, the company I was working wanted to migrate their website based on [handlebarsjs](https://handlebarsjs.com/) to some other more modern js framework and they asked me to choose. 

Everyone kind of knew/want Angular tehre, I had a previus experiense with it. So in I was like "in the end I m gonna choose Angular, but they give me one week, so  I was sure I would have choose  Angular. But I had 1 week to decide, so I decided to write a todo list with Angular, Ember.js and React. 
I Wrote the Angular and Ember with no problem, but then I started with React my initial reaction was "what da F** is this?" I do I display things? Why do I have to use so many callbacks everywhere? Where do I put my business logic? 

I was lost. I understood that my usual [Cowboy Coding Approach](https://en.wikipedia.org/wiki/Cowboy_coding) was not enough to have something working. So I started to search material about React. 


***Enter Pete Hunt, how I got exited about React***

This was the first video I saw, Pete Hunt back then was working at Facebook and he was kind of "The Voice of React". 
Apparently they presented react before this video and some people didn't like it at all, telling ironicly that "facebook was rechinking eb best practices". They use this as the title of this talk that try to explain the React Design decision

*Pete Hunt: React: Rethinking best practices -- JSConf EU*
[![Tux, the Linux mascot](http://i3.ytimg.com/vi/x7cQ3mrcKaY/hqdefault.jpg)](https://www.youtube.com/watch?v=x7cQ3mrcKaY)


here the takeaway were (and they were A LOT): 
- Templates incourage poor separation of concerns
- separating technologies (css, html, js) is not really separating concern
- templates reinvent (in a underpowered way) concepts that already exists in programming languages, like (scoping)[https://en.wikipedia.org/wiki/Scope_(computer_science)]
- not doing spaghetti code is up to you, not to the tecnology. Instead of separate css/html/js, do small component, also, be sure to have components with state separated by component that are pure UI. 
- work with your designer.
- react component are just (idempotent function)[https://en.wikipedia.org/wiki/Idempotence#:~:text=Idempotence%20(UK%3A%20%2F%CB%8C%C9%AA,result%20beyond%20the%20initial%20application.] (aka if you pass a certain input you will `always` have the same output, like in math)
- React components are pure function that you compose, so they are easyer to test
- To simplify your life, immagine your state as a Giant JSON, and immagine to rerender the entire app all the time
- rewrite your entire app every frame for real is slow, the virtual DOM make this efficent automatically render only the difference. [AKA react virtual doom is like the Doom3 engine](https://www.youtube.com/watch?v=x7cQ3mrcKaY&t=1207s)
- Virutal DOM can `run in node JS` this means you can test ui with not super convoluted testing environment


I was amazed by all of this. I didn't understood it all, but in my head I got this image: 
<div>
<img src="https://i.ytimg.com/vi/nYkdrAPrdcw/maxresdefault.jpg" width="300px" height="200px" />
</div>

and I was thinking "oh, my job as developer is just to model the entire state as a big JSON, translate this in visual component according with the designer, and then I m done". More or less. Still my components were very nested, I found myselef pass callback everywere. Also people were saying me "with backbone or angular I don't have to pass those callback everywhere, I just use the 2 way binding". 
That's when I discover Flux.

***Meet Jin Chen, how I discover about Flux***

*Jin Chen: Talking about Flux*
[![Jin Chen Talk](https://res.cloudinary.com/awesomereact/image/youtube/w_460,h_259,c_fill/cSUxHv-kH7w.jpg)](https://www.youtube.com/watch?v=nYkdrAPrdcw&t=632s)

I ve always struggled with MVC. I found it verbose. Plus at this moment I felt the react idea made a lot of sense, but I was strugling doing even the easier thing. 
Luckily I saw this video of  Jin Chang talking about flux, an "unidirectional data flow model"
My understanding here was: 
- MVC can be messy
- 2 way binding is bad, unidirectional flow is good
- make the functionality "unread chat messages" which is bug free is really difficult
- the UI just dispatch actions, the store is taking the action and modifing your state. UI just read the state from the store and react to state changes
- react and flux works very well togheter, they are complementary

In a nutshell I had this image in my mind: 
<div>
<img src="https://imgopt.infoq.com/fit-in/1200x2400/filters:quality(80)/filters:no_upscale()/news/2014/05/facebook-mvc-flux/en/resources/flux-react.png" width="300px" height="200px" />
</div>

also I ve understood why I always struggled with MVC, it can became this: 
<div>
<img src="https://www.freecodecamp.org/news/content/images/2020/04/Screenshot-2020-04-16-at-6.38.14-PM.png" width="300px" height="200px" />
</div>
Which is a mess!

Adding With flux (or a state manager in general) my code became much more clear. In hear I ve remembrered Pete Hunt saying "not doing spaghetti code is up to you". 

More concept I was learning and better my code was becamming. Also I had the feeling that I was learning a lot about javascript and pattern design rather then specific things about React And Flux. 

Also at this point something was clear to me: Facebook is using React for doing facebook itself and instagram. Google back then was not using angular for doing gmail or google. 

I started using that at work. 

***Isomorphic Javascript aka Server Side Rendering***

Somewhere I can find now, I get the concept of [Isomorpchic Javascript](https://en.wikipedia.org/wiki/Isomorphic_JavaScript). 
This means you can render your JS both in the backend and in the frontend. You can do this for 2 reason: 
1. prerender stuff on the backend make feel the loadtime much faster to the user. 
2. if used extensivly, your app can work even wihtout JS. 

Given my context, I was even more amazed by those possibility, but the tools were clearly not making easy all those things. 

##### Phase 2: Improving React knoledge

***The rising of Redux***

*... TODO ...*

Here I am using React and Flux and this promise of a server side rendering. but flux was not really thinked for that. 
To be fear Flux was a library, but it was described with the sentence: "more a pattern then a library"
I remember the impression I had, everyione liked the Flux pattern, but a lot of ppl though the Flux library could be improved. 
So library like https://github.com/yahoo/fluxible and https://acdlite.github.io/flummox were rising. I was even writing mine on top of FLux. I wanted to write samething that makes you achive the SSR in an simple way. 

*Dan Abramov presenting redux* 

[![](https://i3.ytimg.com/vi/xsSnOQynTHs/hqdefault.jpg)](https://www.youtube.com/watch?v=xsSnOQynTHs)


hot reload? "time travel"? are you craxy? I rememberd I though "ok, this guy as won".
I abbandoned any work I was doing to my framework based on flux and I started to use it. 

Redux was everything I wanted and it was offering a lot of things that I didn't know yet I wanted. 
The vast majority of it was just javascript (an action is just a json, a reducer is just a function, the compose utils was litteraly something he could have been released by itelf). 

I started to use it but after a while I had some problem writing code, I felt I was nesting a lot of things and my code was generically hard to change. I thought that maybe the fault was that redux was too long to write, so I tryied to reduce the boilerplate writing a framework on top of redux called [reduxt](https://www.npmjs.com/package/reduxt). It didn't helped much (and looking this know I feel a little bit of shame for reduxt :P). As often to me while using React, the problem was not the tool itself, but the way you are designing your code. Luckily I read this MUST READ article of Dan Abramov: [Presentational and Container Components
](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0#:~:text=While%20container%20components%20tend%20to,as%20classes%20and%20as%20functions.) and my life changed. I realised that no other tools or library were needed, I ve just needed to learn how to organize my code better. 

Now my state was written in a bunch of pure js functions (the reducers) and the visualization was written in a bunch of components that were as well pure js functions (what dan called presentational component in the article). another way to see it is the following: 1 your state is just a big JSON object 2 this json object is generated by the your reducers that accept an action and the prevState and return a specific part of the state, 3 the presentational components take part of those json using maybe some selectors and they just render it in HTML. 
Everything else a side those  things is just gloo you write to make stuff work, namely Containers Components, Sagas , middleware , etc etc..

The good part is that you can write your UI and THEN make it work for real. I still remember when I wrote my login/logout logic. As you can immagine in the first iteration I was loosing the login every time I ve refreshed the page. To solve that, I ve just to added a middleware (maybe [this one](https://github.com/BartWaardenburg/redux-simple-storage-middleware)) and it just worked, with 0 changed in every part of the code. If you have experience with redux this could seems obvious, but to me back then, I could feel how much feel "clean" working with react and redux.

takeaways: 
- the "important" thing in your website are: store, reducers, selectors, actions, presentational components. 
- every side effect should be outside of those (unless in the action you are using thunk), typically in middlewares
- the vast majority of your UI is in the presentational components.


*** How to work with the designer: Styleguide ***

I was starting be confident with react, and in this period I started a semi-serius pet project with a colegue of mine, who was a UI/UX designer who could code some JS. 

One of the thing the React team was stressing in their talk was to work a lot with the designer, if the UX designer is using a tool like desing tools like Figma or Sketch, the way they organize their components should be exaclty the same as your UI component. 

In my experience this is true if your designer is focusing a lot on the UX, that means usability, wich means consistency, wich usually means the abstract the UI in the right way reusing components when it make sense. 

Luckily for me this was the situation, so in this side project I did the backend and in the frontend I let the designer write entirely by himself the presentational component. 




***The React Router***

*... TODO ...*

[![](https://i3.ytimg.com/vi/Vur2dAFZ4GE/hqdefault.jpg)](https://www.youtube.com/watch?v=Vur2dAFZ4GE)

***How to write Component that do logic***

*... TODO ...*

[![](https://i3.ytimg.com/vi/kp-NOggyz54/hqdefault.jpg)](https://www.youtube.com/watch?v=kp-NOggyz54)


***How to write Component that do logic***

*... TODO ...*

[![](https://i3.ytimg.com/vi/kp-NOggyz54/hqdefault.jpg)](https://www.youtube.com/watch?v=kp-NOggyz54)

**"Recent" react stuff**

***React Hooks and context API***



**Possibilities and tools react allows**

***Next.js the missing framework***

That's a quote from a friend of mine . 
Next js was making it easier the webpack configuration, you can do it only if you got 


