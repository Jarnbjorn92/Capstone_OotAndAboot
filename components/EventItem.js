import React from "react";
import { useState, useEffect } from "react";
import { Linking } from "react-native";
import { Text, View, Image, Button, StyleSheet } from "react-native";

const EventItem = ({
  event,
  user,
  eventPost,
  patch,
  javaEvents,
  clickRefresh,
  open,
  handleOpen,
  toggle,
  handleOnPressBack,
  handleOnPress
}) => {
  const name = event.name;
  const date = event.dates.start.localDate;
  const time = event.dates.start.localTime;
  const venue = event._embedded.venues[0].name;
  const status = event.dates.status.code;
  const image = event.images[1];

  const [interest , setInterest]= useState(false);
  const [contact , setContact]= useState(false);

  useEffect(() => {
    interestAndContact();
  },[toggle])

  function interestAndContact(){
    for (const javaEvent of javaEvents) {
      if (javaEvent.event_id === event.id) {
        const isInterested = javaEvent.event_interested.some((userI) => userI.id === user.id);
        const isContact = javaEvent.event_contact.some((userI) => userI.id === user.id);
        if(isInterested){
          setInterest(true)
        }else{
          setInterest(false)
        }
        if(isContact){
          setContact(true)
        }else{
          setContact(false)
        }

      }
    }
  }



  // const genre = if(event.classifications[0].genre.name !== null){return event.classifications[0].genre.name}

 

  // some titles have date and title in the name!

  //for loop through event_id in database and if it exists set that as the state and then update that object
  //if it doesnt exist create a new entry with blank event object like above
  //
  function handleInterested() {
    for (const javaEvent of javaEvents) {
      if (javaEvent.event_id === event.id) {
        const interestedUserExists = javaEvent.event_interested.some(
          (userI) => userI.id === user.id
        );
        if (!interestedUserExists) {
          javaEvent.event_interested.push(user);
          patch(javaEvent, javaEvent.id);
          interestAndContact();
        } else {
          const results = javaEvent.event_interested.filter(
            (checkUser) => checkUser.id != user.id
          );
          javaEvent.event_interested = results;
          patch(javaEvent, javaEvent.id);
          interestAndContact();
        }
      }
    }

    const eventExists = javaEvents.some(
      (javaEvent) => javaEvent.event_id === event.id
    );
    if (!eventExists) {
      const payload = {
        event_id: event.id,
        event_contact: [],
        event_going: [],
        event_interested: [user],
        event_name: event.name,
        event_date: event.dates.start.localDate,
        event_time: event.dates.start.localTime,
      };

      eventPost(payload);
      clickRefresh();
      interestAndContact();
    }
  }

  function handleContact() {
    for (const javaEvent of javaEvents) {
      if (javaEvent.event_id === event.id) {
        const interestedUserExists = javaEvent.event_interested.some(
          (userI) => userI.id === user.id
        );
        const contactUserExists = javaEvent.event_contact.some(
          (userI) => userI.id === user.id
        );

        if (!interestedUserExists && !contactUserExists) {
          javaEvent.event_contact.push(user);
          javaEvent.event_interested.push(user);
          patch(javaEvent, javaEvent.id);
          interestAndContact();
        } else if (!contactUserExists) {
          javaEvent.event_contact.push(user);
          patch(javaEvent, javaEvent.id);
          interestAndContact();
        } else if (contactUserExists) {
          const results = javaEvent.event_contact.filter(
            (checkUser) => checkUser.id != user.id
          );
          javaEvent.event_contact = results;
          patch(javaEvent, javaEvent.id);
          interestAndContact();
        }
      }
    }

    const eventExists = javaEvents.some(
      (javaEvent) => javaEvent.event_id === event.id
    );
    if (!eventExists) {
      const payload = {
        event_id: event.id,
        event_contact: [user],
        event_going: [],
        event_interested: [user],
        event_name: event.name,
        event_date: event.dates.start.localDate,
        event_time: event.dates.start.localTime,
      };

      eventPost(payload);
      clickRefresh();
      interestAndContact();
    }
  }

  loadInBrowser = () => {
    Linking.openURL(event.url).catch((err) =>
      console.error("Couldn't load page", err)
    );
  };
  
  return (
    <View>
      {open ? (
        <View style={styles.cardContainer}>
          <Image style={styles.image} source={image}></Image>
          <Text style={styles.text}>{name}</Text>
          <Text style={styles.text}>{date}</Text>
          <Text style={styles.text}>{time}</Text>
          <Text style={styles.text}>{venue}</Text>
          <View style={styles.buttons}>
          <Button onPress={handleOpen} title="Info" />
          <Button style={styles.contact} color={contact ? "orchid" : "palegreen"} onPress={handleContact} title="Contact" />
          <Button  style={styles.interest} color={interest ? "crimson" : "yellow"} onPress={handleInterested} title="Interest" />
          </View>
        </View>
      ) : (
        <View style={styles.cardContainer}>
          <Image style={styles.image} source={image}></Image>
          <Text style={styles.text}>{name}</Text>
          <Text style={styles.text}>{date}</Text>
          <Text style={styles.text}>{time}</Text>
          {/* {genre !== null ?
      (<Text style={styles.text}>Classification: {genre}</Text>) : <View></View>} */}
          <Text style={styles.text}>{venue}</Text>
          <Text style={styles.text}>Status: {status}</Text>
          <Button onPress={loadInBrowser} title="BUY TICKETS" />
          <View style={styles.buttons}>
          <Button onPress={handleOpen} title="Back" />
          <Button style={styles.contact} color={contact ? "orchid" : "palegreen"} onPress={handleContact} title="Contact" />
          <Button style={styles.interest} color={interest ? "crimson" : "yellow" } onPress={handleInterested} title="Interest"  />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    display: "flex",
    width: 400,
    height: 650,
    top: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#666666",
    shadowOffset: { width: 10, height: 15 },
    shadowColor: "black",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderRadius: 20,
  },
  image: {
    width: 400,
    height: 400,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  text: {
    top: 10,
    height: 28,
    justifyContent: "center",
    display: "flex",
    alignItems: "center",
  },
  buttons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  interest: {
    color: "firebrick"
  },
  contact: {
  color: "yellow"
  }
});

export default EventItem;
