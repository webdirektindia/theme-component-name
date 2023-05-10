import { ajax } from "discourse/lib/ajax";
import Topic from "discourse/models/topic";

// Will render for topic-above-suggested plugin outlet
export default {

    setupComponent(args, component) {
        try {
            const path = location.pathname;
        
            // check if url matches
            if(/^\/t\//.test(path) && this.get('model.tags') && this.get('model.tags').length > 0 && settings.number_of_related_topics_to_display > 0){

                let relatedTopicsTag;
                // get the tags of the current topic
                let currentTopicTags = this.get('model.tags');

                let currentTopicId = this.get('model.id');

                let tag; //temp var to store tag

                // select the tag for which related topics should be displayed
                if (tag = currentTopicTags.find(tag => tag.toLowerCase() === "cumulocity-iot")) {
                    relatedTopicsTag = tag;
                }
                else if(tag = currentTopicTags.find(tag => tag.toLowerCase() === "webmethods-io-integration")) {
                    relatedTopicsTag = tag;
                } 
                else if(tag = currentTopicTags.find(tag => tag.toLowerCase() === "webmethods-io-b2b")) {
                    relatedTopicsTag = tag;
                }
                else if(tag = currentTopicTags.find(tag => tag.toLowerCase() === "api-management")) {
                    relatedTopicsTag = tag;
                }
                else if(tag = currentTopicTags.find(tag => tag.toLowerCase() === "webmethods")) {
                    relatedTopicsTag = tag;
                }            
                else if(tag = currentTopicTags.find(tag => tag.toLowerCase() === "adabas-natural")) {
                    relatedTopicsTag = tag;
                }
                else { // select the first tag from the currentTopicTags
                    relatedTopicsTag = currentTopicTags[0];
                }

                // add a class to the HTML tag for easy CSS targetting
                $('html').addClass('display-custom-related-topics');

                // we'll use this later to show our template
                component.set('displayRelatedTopics', true);

                // helps us show a loading spinner until topics are ready
                component.set("loadingTopics", true);

                // Get posts from tag using AJAX
                let tagJsonUrl = "/tag/" + relatedTopicsTag + "/l/latest.json";
                ajax(tagJsonUrl).then (function(result){

                    // Create an empty array, we'll push topics into it
                    let relatedTopics = [];

                    // Get the relevant users
                    var relatedTopicUsers = result.users;
                    
                    // Get the topic list from response
                    let topicList = result.topic_list.topics;
                    
                    // Remove the current topic from the topic list.
                    const index = topicList.findIndex((topic) => topic.id === currentTopicId);
                    if (index > -1) { // only splice topicList array when item is found
                        topicList.splice(index, 1); // 2nd parameter means remove one item only
                    }

                    if(topicList.length > 0) {
                        // We're extracting the topics starting at 0 and ending at settings.number_of_related_topics_to_display (deafult value is 5)
                        // This means we'll show 5 total.
                        topicList.slice(0,settings.number_of_related_topics_to_display).forEach(function(topic){
                            // Associate users with our topic
                            topic.posters.forEach(function(poster){
                                poster.user = $.grep(relatedTopicUsers, function(e){ return e.id == poster.user_id; })[0];
                            });

                            // Push our topics into the RelatedTopics array
                                relatedTopics.push(Topic.create(topic));
                        });

                        // Topics are loaded, stop showing the loading spinner
                        component.set("loadingTopics", false);

                        // Setup our component title
                        component.set('relatedTopicsTitle',settings.related_topics_title);

                        // Setup our component with the topics from the array
                        component.set('relatedTopics', relatedTopics);
                    }
                    else {
                    // if there are no realted topics for the selected tags
                        // Remove our custom class
                        $('html').removeClass('display-custom-related-topics');

                        // Don't display our custom-related-topics
                        component.set('displayRelatedTopics', false);
                    }
                });

            } 
            else {
            // If the page doesn't match the urls above or current topics don't have tags, do this:
                // Remove our custom class
                $('html').removeClass('display-custom-related-topics');

                // Don't display our custom-related-topics
                component.set('displayRelatedTopics', false);
            }
        } 
        catch (error) {
            // Remove our custom class
            $('html').removeClass('display-custom-related-topics');

            // Don't display our custom-related-topics
            component.set('displayRelatedTopics', false);
            
            console.error(
                "There's an issue in while loading Related Topics Component. Check if your settings are entered correctly",
                error
              );
        }
    }
};