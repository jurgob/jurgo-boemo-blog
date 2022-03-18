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

#### Why you should read this

By telling you my story I would like you to understand that getting a new framework takes time, you don't get it all in 5 min (or at least I don't). 

By giving some "historical" context of how was the frontend world when React came out, I hope to highlinght why React was a big thing back then. 

In the end I hope I will give a brief reacap of all the main React concepts.
But keep in mind, this is not a React developer guide, there are a lot of better articles and guided for that, starting with the amazing [Official React Documentation](https://reactjs.org/docs/getting-started.html)


#### The Journey 

**London December 2017**

I start my fist job in London as a frontend developer, the company I was working wanted to migrate their website based on [handlebarsjs](https://handlebarsjs.com/) to some other more modern js framework and they asked me to choose. 

Everyone kind of knew/want Angular tehre, I had a previus experiense with it. So in I was like "in the end I m gonna choose Angular, but they give me one week, so  

Pete Hunt: React: Rethinking best practices -- JSConf EU
https://www.youtube.com/watch?v=x7cQ3mrcKaY

here the takeaway were: 
- separating technologies (css, html, js) is not really separating concern
- virtual dom: with this approach, you can test ui with not super convoluted testing environment


Jin Chen: Talking about Flux
https://www.youtube.com/watch?v=nYkdrAPrdcw&t=632s

I ve always struggled with MVC. I found it verbose. 
Here I heard Jin Chang talking about flux, an "unidirectional data flow model"
My understanding here was: 
- 2 way binding bad, unidirectional flow good


Pete Hunt: Talking about react
https://www.youtube.com/watch?v=nYkdrAPrdcw&t=1457s

- he said something like "react is like doom3"


Also at this point something was clear to me: Facebook is using React for doing facebook itself and instagram. Google back then was not using angular for doing gmail or google. 


At this point I was stating using testing react seriusly. I was deploying a POC for my company. 
We got React and the Flux pattern, and this promise of a server side rendering. but flux was not really thinked for that. 
To be fear Flux was a library, but it was described with the sentence: "more a pattern then a library"
I remember the impression I had, everyione liked the Flux pattern, but a lot of ppl though the Flux library could be improved. 
So library like https://github.com/yahoo/fluxible and https://acdlite.github.io/flummox were rising. I was even writing mine on top of FLux. I wanted to do fast easier and have the SSR by default. 

enter Dan Abramov and redux: 
https://www.youtube.com/watch?v=xsSnOQynTHs

hot reload? "time travel"? are you craxy? I rememberd I though "ok, this guy as won".


