import styled from 'styled-components';

const Container = styled.div`
  width: 80%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.25rem;
  background-color: #f1f5f9;
  border-radius: 0.375rem;
  margin-bottom: 1.25rem;
`;

const Image = styled.img`
  width: 8%;
`;

const InputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.625rem 3rem 0.625rem 1.25rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
`;

const ImageIcon = styled.img`
  position: absolute;
  right: 1rem;
  top: 25%;
`;

const PostContainer = styled.div`
  background-color: white;
  display: grid;
  height: 100%;
  margin-bottom: 1.25rem;
  border-radius: 0.375rem;
  
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.75rem;
`;

const UserContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const UserDetails = styled.div`
  line-height: 1.25rem;
`;

const TimeStamp = styled.span`
  font-size: 0.875rem;
`;

const StyledButton = styled.button`
  font-family: 'DM Sans', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.25rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.3rem;

  &:hover {
    background-color: #FFFAC5;
  }
`;

const DeleteButton = styled(StyledButton)`
  background-color: #FF6A6A;

  &:hover {
    background-color: #D9153B;
  }
`;

const TextContent = styled.div`
  font-weight: normal;
  color: black;
  padding: 0.75rem 1.75rem;
`;

const Footer = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 1.75rem;
`;

export {
  Container, Image, InputContainer, Input, ImageIcon, PostContainer, 
  PostHeader, UserContainer, UserDetails, TimeStamp, StyledButton, DeleteButton,
  TextContent, Footer
};
