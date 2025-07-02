import React, { useEffect, useRef, useState } from "react";
import { Box, Button } from "@chakra-ui/react";

const AdPlayer = ({ maxW, w, type = "small", onAdStatusChange }) => {
  const [showAd, setShowAd] = useState(true);
  const [canSkip, setCanSkip] = useState(false);
  const [timer, setTimer] = useState(10);
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    if (video && showAd) {
      video.currentTime = 0;
      video.play().catch((err) => {
        console.warn("Autoplay failed", err);
        setShowAd(false);
        onAdStatusChange?.(false);
      });

      setCanSkip(false);
      setTimer(10);
      onAdStatusChange?.(true);

      countdownRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            setCanSkip(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      video.onended = () => {
        if (type === "full") {
          setShowAd(false);
          onAdStatusChange?.(false);
          timerRef.current = setTimeout(() => {
            setShowAd(true);
            setCanSkip(false);
            setTimer(10);
            videoRef.current?.play();
            onAdStatusChange?.(true);
          }, 10000);
        } else {
          // For small ad, loop
          video.loop = true;
        }
      };
    }

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(countdownRef.current);
    };
  }, [type, showAd, onAdStatusChange]);

  const handleSkip = () => {
    const video = videoRef.current;
    if (video) video.pause();

    setShowAd(false);
    onAdStatusChange?.(false);
    clearInterval(countdownRef.current);
  };

  const handleExit = () => {
    const video = videoRef.current;
    if (video) video.pause();

    setShowAd(false);
    onAdStatusChange?.(false);
    clearInterval(countdownRef.current);
    clearTimeout(timerRef.current);
  };

  if (!showAd) return null;

  return (
    <Box position="relative" w={w} maxW={maxW} mx="auto" bg={type === "full" ? "black" : "transparent"}>
      <video
        ref={videoRef}
        controls={false}
        autoPlay
        muted
        playsInline
        className={`rounded-[8px] ${type === "full" ? 'w-screen h-screen' : 'w-full h-auto'}`} 
      >
        <source src="https://nectoworld.in/ad.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Common UI for both full and small */}
      <>
        {/* Skip Button */}
        {canSkip && (
          <Button
            onClick={handleSkip}
            position="absolute"
            top="4"
            right="4"
            zIndex="10"
            bg="white"
            color="black"
            size="sm"
            _hover={{ bg: "gray.200" }}
          >
            Skip Ad
          </Button>
        )}

        {/* Countdown Timer */}
        {timer > 0 && (
          <Box
            position="absolute"
            bottom="4"
            left="50%"
            transform="translateX(-50%)"
            bg="rgba(0, 0, 0, 0.6)"
            color="white"
            px="4"
            py="2"
            borderRadius="md"
            fontSize="sm"
            zIndex="10"
          >
            Skip available in {timer} second{timer !== 1 ? "s" : ""}
          </Box>
        )}

        {/* Exit Button */}
        <Button
          onClick={handleExit}
          position="absolute"
          top="4"
          left="4"
          zIndex="10"
          color="white"
          bg="rgba(0,0,0,0.6)"
          size="xs"
          borderRadius="full"
          fontWeight="bold"
          _hover={{ bg: "red.500" }}
        >
          ✕
        </Button>
      </>
    </Box>
  );
};

export default AdPlayer;
