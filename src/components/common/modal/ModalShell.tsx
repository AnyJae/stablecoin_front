import { X } from "lucide-react";
import React, { ReactNode } from "react";
import styled from "styled-components";

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function ModalShell({children, isOpen, onClose }: ModalShellProps) {
  if (!isOpen) return null;

  return (
    <Overlay>
      <Container>
        <CloseButton onClick={onClose}/>
        <ScrollBody>{children}</ScrollBody>
      </Container>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(3px);
  background-color: rgba(109, 109, 109, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Container = styled.div`
  position: relative;
  box-sizing: border-box;
  background: #343035;
  color:white;
  border-radius: 12px;
  padding: 25px 15px 25px 25px;
  max-width: 95%;
  max-height: 80%;
  overflow: hidden;
  display: flex;
`;

const ScrollBody = styled.div`
  overflow-y: auto;
  flex-grow: 1;
  padding-right: 13px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  /* 스크롤바 트랙 (배경) */
  &::-webkit-scrollbar-track {
    width: 20px;
  }

  /* 스크롤바 썸 (움직이는 막대) */
  &::-webkit-scrollbar-thumb {
    background: #B3B3B3;
    border-radius: 10px;
  }

  /* 스크롤바 썸에 hover 효과 */
  &::-webkit-scrollbar-thumb:hover {
    background: #1bdebec1;
  }
`;

const CloseButton = styled(X)`
  position: absolute;
  top: 10px;
  right: 10px;
  color: #B3B3B3;

  &:hover{
    color: #1bdebec1;
  }
`;
