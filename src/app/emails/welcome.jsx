import {
    Body,
    Container,
    Column,
    Head,
    Heading,
    Hr,
    Html,
    Row,
    Section,
    Text,
    Link,
    Img
  } from "@react-email/components";
  import { Tailwind } from "@react-email/tailwind";
  
  import * as React from "react";
  
  export const Welcome = ({
    userId,
  }) => {
    return (
      
        <Html>
          <Tailwind>
          <Head />
          <Body className="bg-gray-100 my-auto mx-auto font-sans px-2">
            <Container className="my-[40px] mx-auto p-[20px] max-w-[600px]">
              <Heading className=" font-normal text-center p-0 my-[30px] mx-0">
                <Link className="text-black" href={"https://devlingo.com.br?utm_source=newsleter&utm_medium=email"}>{`</lingo>`}</Link>
              </Heading>
              <Text className="text-[32px] text-center text-white text-center bg-gray-900 py-24 m-0 leading-[36px]">
                {`🇺🇸 "Welcome"`} <br/>
                <em className="text-[24px] mt-[6px]">{`🇧🇷 Seja bem-vindo`}</em>
              </Text>
              
              <Section className="mt-[0px] bg-white px-10 py-5 hidden sm:block rounded-md rounded-tl-none	rounded-tr-none">
              <Row>
                    <Column valign="top">
                      <strong className="text-[18px] text-gray-400">{`adjetivo`}</strong>
                    </Column>
  
                    <Column valign="right">
                      <ol className="mt-0 pt-0">
                      <li className="text-[16px] mb-4">bem acolhido à chegada; bem recebido.</li>
                      <li className="text-[16px] mb-4">que chega ou chegou bem, a salvo.</li>
                      </ol>
                    </Column>
                  </Row>
              </Section>
              <Section className="mt-[0px] bg-white px-6 sm:px-10 py-5 block sm:hidden rounded-md">
              <Row>
                    <Column valign="right">
                    <strong className="text-[18px] text-gray-400">{`adjetivo`}</strong>
                      <ol className="mt-0 pt-0">
                      <li className="text-[16px] mb-4">bem acolhido à chegada; bem recebido.</li>
                      <li className="text-[16px] mb-4">que chega ou chegou bem, a salvo.</li>
                      </ol>
                    </Column>
                  </Row>
              </Section>
              <Section className="mt-[32px] mb-[32px] bg-white px-10 py-5 rounded-md">
                <Row>
                  <Column>
                    <Text className="text-[24px]">
                      {`O que você vai encontrar aqui no </lingo>?`}
                    </Text>
                  </Column>
                </Row>
                <Row>
                  <Column>
                    <Text>
                      {`Nossa missão é facilitar e tornar divertida o aprendizado do vocabulário técnico para desenvolvedores. Como conseguimos isso? Enviando aos nossos assinantes uma nova palavra ou conceito técnico para aprender todas as manhãs. Basta confirmar seu e-mail e você começará a aprimorar sua comunicação técnica, tornando-a mais rica e precisa.`}
                    </Text>
  
                  </Column>
                </Row>
              </Section>
              
              <Section className="mt-[32px] mb-[32px] bg-white px-10 py-5 rounded-md">
                <Row>
                  <Column>
                    <Text className="text-[24px]">
                      {`Curtiu? Agora manda pra um amigo! `}
                      
                    </Text>
                  </Column>
                </Row>
                <Row>
                  <Column>
                  <Img src={`https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExNThvNHExNHJmaXg5N3VxNDdhcnpqMDdxY2xvbDZsZHZuN3l2M3h3dSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/GrkrL1cGVv0FW/giphy.gif`} alt="The it crowd" />
                  </Column>
                </Row>
                <Row>
                  <Column>
                    <Text className="text-[16px]">
                      {`O projeto </lingo> nasceu de um sonho individual de fazer a diferença na vida dos programadores, oferecendo ferramentas e recursos de qualidade sem custo. Nosso objetivo é crescer e continuar a oferecer nosso serviço gratuitamente para você, o consumidor final. Mas, para isso, precisamos da sua ajuda!`}
                    </Text>
                  </Column>
                </Row>
                <Row>
                  <Column>
                  <h3> Como você contribui para o nosso crescimento?</h3>
                  </Column>
                </Row>
                <Row>
                  <Column>
                  <ul className="text-[16px]">
                        <li className="mb-2">Divulgue para os amigos: Se você acha que o que fazemos aqui pode ajudar mais pessoas, compartilhe o {`</lingo>`} pelo {" "}
                          <Link href={`https://api.whatsapp.com/send?text=${encodeURI(`Pessoal da uma olhada nessa newsletter que eu encontrei para ajudar a galera que está querendo aprender inglês, é só se inscrever em https://devlingo.com.br`)}`}>
                            Whatsapp
                          </Link>, <Link href={`https://twitter.com/intent/post?text=${encodeURI("Pessoal da uma olhada nessa newsletter que eu encontrei para ajudar a galera que está querendo aprender inglês, é só se inscrever")}&url=${encodeURI("https://devlingo.com.br")}`}>Twitter</Link> {" "} ou {" "} <Link href=""> Linkedin</Link>. Um pequeno gesto seu pode significar um grande passo para nós.
                        </li>
                        <li className="mb-2">Interaja com anúncios: Sabemos que anúncios podem ser um incômodo, mas, se eventualmente aparecerem por aqui, clicar neles é uma maneira simples e eficaz de nos apoiar sem custo algum para você.</li>
                        <li className="mb-2">Mencione-nos: Se encontrar uma oportunidade profissional por meio do {"</lingo>"}, mencione-nos ao se candidatar. Isso ajuda a fortalecer nossa rede e a mostrar o valor da nossa comunidade.</li>
                      </ul>
                      
                  </Column>
                </Row>
                <Row>
                  <Column>
                      <p className="text-[16px]">Juntos, podemos fazer do {`</lingo>`} uma ferramenta ainda mais poderosa para programadores em todo o mundo. </p>
                      <p className="text-[16px]">Obrigado por fazer parte desta jornada conosco!</p>
                  </Column>
                </Row>
              </Section>
              <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
              <Text className="text-[#666666] text-center text-[12px] leading-[24px]">
                Caso não queira receber mais e-mails como esse basta clicar nesse <Link href={`https://devlingo.com.br/api/rmSub?id=${userId}`}>{` link `}</Link>  
                vamos ficar muito triste, espero que um dia você volte. Fique a vontade para mandar o {`</lingo>`} <Link href={`https://devlingo.com.br`}>{` para um amigo `}</Link>.
              </Text>
            </Container>
          </Body>
          </Tailwind>
        </Html>
        
      
    );
  };
  
  Welcome.PreviewProps = {
    userId: "1235455"
  };
  
  export default Welcome;
  