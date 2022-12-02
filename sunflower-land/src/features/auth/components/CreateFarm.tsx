import React, { useContext, useState } from "react";
import { Carousel, CarouselItem } from "react-bootstrap";
import shuffle from "lodash.shuffle";
import ReCAPTCHA from "react-google-recaptcha";

import { Button } from "components/ui/Button";
import { OuterPanel } from "components/ui/Panel";

import question from "assets/icons/expression_confused.png";
import leftArrow from "assets/icons/arrow_left.png";
import rightArrow from "assets/icons/arrow_right.png";
import { Context } from "../lib/Provider";
import { useActor } from "@xstate/react";
import { Blocked } from "./Blocked";
import { CONFIG } from "lib/config";
import { PIXEL_SCALE } from "features/game/lib/constants";

export const roundToOneDecimal = (number: number) =>
  Math.round(number * 10) / 10;

export enum CharityAddress {
  TheWaterProject = "0xBCf9bf2F0544252761BCA9c76Fe2aA18733C48db",
  PCF = "0x8c6A1870D922279dB6F91CB6798592c7A7133BBD",
  // Heifer = "0xD3F81260a44A1df7A7269CF66Abd9c7e4f8CdcD1",
  // CoolEarth = "0x3c8cB169281196737c493AfFA8F49a9d823bB9c5",
}
interface Charity {
  name: string;
  info: string;
  url: string;
  address: CharityAddress;
}

const CHARITIES: Charity[] = shuffle([
  {
    name: "The Water Project",
    info: "You can provide clean, safe and reliable water today.",
    url: "https://thewaterproject.org/donate-ethereum",
    address: CharityAddress.TheWaterProject,
  },
  {
    name: "Purple Community Fund",
    info: "To help poverty stricken families and communities transform their own lives with our skills training, education, health and nutrition programmes.",
    url: "https://www.p-c-f.org/",
    address: CharityAddress.PCF,
  },
  // {
  //   name: "The Heifer Project",
  //   info: "We do more than train farmers. We grow incomes.",
  //   url: "https://www.heifer.org/give/other/digital-currency.html",
  //   address: CharityAddress.Heifer,
  // },
  // {
  //   name: "Cool Earth",
  //   info: "Aim to halt deforestation and its impact on our climate.",
  //   url: "https://www.coolearth.org/cryptocurrency-donations/",
  //   address: CharityAddress.CoolEarth,
  // },
]);

interface CharityDetailProps extends Charity {
  onDonateAndPlayClick: (address: CharityAddress) => void;
}

const CharityDetail = ({
  url,
  name,
  info,
  address,
  onDonateAndPlayClick,
}: CharityDetailProps) => {
  const onAboutClick = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <OuterPanel className="flex-col inline-flex items-center justify-center w-full">
      <div className="flex flex-col items-center mb-3 whitespace-normal">
        <h5 className="text-sm underline mb-3 text-center">{name}</h5>
        <p className="text-xs text-center mb-2 px-5 two-line-ellipsis">
          {info}
        </p>
      </div>

      <div className="flex w-full z-10">
        <Button
          className="w-full mr-1"
          onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            onAboutClick(url), e.preventDefault();
          }}
        >
          <span className="text-xs mr-1">About</span>
          <img src={question} className="scale-110" alt="question-mark" />
        </Button>
        <Button
          className="w-full ml-1"
          onClick={() => onDonateAndPlayClick(address)}
        >
          <span className="text-xs whitespace-nowrap">Donate & Play</span>
        </Button>
      </div>
    </OuterPanel>
  );
};

export const CreateFarm: React.FC = () => {
  const [charity, setCharity] = useState<string>();
  const [activeIdx, setActiveIndex] = useState(0);
  const { authService } = useContext(Context);
  const [authState] = useActor(authService);
  const [showCaptcha, setShowCaptcha] = useState(false);

  const onCaptchaSolved = async (token: string | null) => {
    await new Promise((res) => setTimeout(res, 1000));

    authService.send("CREATE_FARM", {
      charityAddress: charity,
      donation: 10,
      captcha: token,
    });
  };

  const onDonateAndPlayClick = (charityAddress: CharityAddress) => {
    setCharity(charityAddress);
    setShowCaptcha(true);
  };

  const updateActiveIndex = (newIdx: number) => {
    if (newIdx < 0) {
      setActiveIndex(0);
    }

    if (newIdx > CHARITIES.length - 1) {
      setActiveIndex(CHARITIES.length - 1);
      return;
    }

    setActiveIndex(newIdx);
  };

  if (!authState.context.token?.userAccess.createFarm) {
    return <Blocked />;
  }

  if (showCaptcha) {
    return (
      <ReCAPTCHA
        sitekey={CONFIG.RECAPTCHA_SITEKEY}
        onChange={onCaptchaSolved}
        onExpired={() => setShowCaptcha(false)}
        className="w-full m-4 flex items-center justify-center"
      />
    );
  }

  return (
    <form className="mb-4 relative">
      <div className="flex flex-col items-center">
        <h2 className="text-base mb-2">$5 USD to play</h2>
        <p className="text-xs mb-3 text-center">
          To play Sunflower Land, you first need to mint an Account NFT for $5
          USD (paid in MATIC)
        </p>
        <p className="text-xs mb-3 text-center">
          10% of this fee will be donated to a charity of your choice.
        </p>
      </div>
      <p className="text-center mb-3 mt-10">Select a charity</p>
      <Carousel
        activeIndex={activeIdx}
        onSelect={updateActiveIndex}
        prevIcon={
          <img
            src={leftArrow}
            alt="left-arrow"
            className="absolute cursor-pointer"
            style={{
              width: `${PIXEL_SCALE * 11}px`,
            }}
            onClick={() => updateActiveIndex(activeIdx - 1)}
          />
        }
        nextIcon={
          <img
            src={rightArrow}
            alt="right-arrow"
            className="absolute cursor-pointer"
            style={{
              width: `${PIXEL_SCALE * 11}px`,
            }}
            onClick={() => updateActiveIndex(activeIdx + 1)}
          />
        }
      >
        {CHARITIES.map((props: Charity) => (
          <CarouselItem key={props.url}>
            <CharityDetail
              {...props}
              onDonateAndPlayClick={onDonateAndPlayClick}
            />
          </CarouselItem>
        ))}
      </Carousel>
    </form>
  );
};
