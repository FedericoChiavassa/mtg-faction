import { createFileRoute } from '@tanstack/react-router';
import { Mail } from 'lucide-react';

import { Container } from '@/components/layout/container';
import {
  PageHeader,
  PageHeaderCaption,
  PageHeaderTitle,
} from '@/components/layout/page-header';
import ContactForm from '@/features/contact/contact-form';

export const Route = createFileRoute('/_app/contact')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <PageHeader>
        <PageHeaderCaption>Get in touch</PageHeaderCaption>
        <PageHeaderTitle icon={Mail}>Contact</PageHeaderTitle>
      </PageHeader>
      <Container className="py-10">
        <ContactForm />
      </Container>
    </>
  );
}
