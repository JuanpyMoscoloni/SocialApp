import React, { useState } from "react";
import { ReactSVG } from "react-svg";
import { ChatIcon } from "../../utilities";
export default function Contacts({ contacts, changeChat }) {
  const [currentSelected, setCurrentSelected] = useState(undefined);

  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
  };
  return (
    <>
      <section className=" grid 2xl:grid-rows-[10%,85%,5%] grid-rows-[20%,75%] max-xl:grid-rows-[90%,10%] bg-white dark:bg-[#131324]">
        <div className="flex justify-center items-center my-4 gap-[2rem] max-xl:hidden  border-b border-white/30">
          <h3 className="text-black dark:text-white font-bold max-xl:hidden ">
            CHATS
          </h3>
        </div>
        <div className="flex flex-col max-xl:overflow-x-hidden gap-[0.8rem] max-xl:overflow-y-scroll">
          {contacts.length < 1 ? (
            <div className="h-[20rem] w-full max-md:bg-white max-md:text-center flex flex-col items-center gap-y-[1rem] max-xl:justify-center md:px-[2rem]">
              <ChatIcon />
              <h1 className="text-xl max-md:text-lg font-semibold dark:text-white text-center">
                You do not have contacts yet.
              </h1>
              <p className="text-lg max-md:text-sm dark:text-white text-center opacity-40">
                Follow people to appear here.
              </p>
            </div>
          ) : (
            contacts.map((contact, index) => {
              return (
                <div
                  key={contact._id}
                  className={`contact max-xl:flex-col max-xl:gap-2 max-xl:p-2 max-xl:my-4 pl-10 ${
                    index === currentSelected
                      ? "dark:bg-white/10 bg-gray-100 w-full px-3 py-6 text flex items-center gap-6  cursor-pointer "
                      : " text-black dark:text-white px-3 py-6 flex items-center gap-6 cursor-pointer "
                  }`}
                  onClick={() => changeCurrentChat(index, contact)}
                >
                  <div>
                    <ReactSVG
                      src={`data:image/svg+xml;base64,${btoa(
                        contact.avatarImage
                      )}`}
                      className="color-item  rounded-full w-16 h-16"
                    />
                  </div>
                  <div className=" font-bold text-lg">
                    <h3 className="uppercase">{contact.username}</h3>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </>
  );
}
