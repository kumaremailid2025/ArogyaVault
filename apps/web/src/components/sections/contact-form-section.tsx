"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MailIcon, PhoneIcon, MapPinIcon,
  SendIcon, CheckCircleIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Textarea } from "@/core/ui/textarea";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/core/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/core/ui/select";
import { Container, Section, Grid, Stack, Row } from "@/core/primitives";
import { H3, H4, Text, Muted } from "@/core/primitives";
import { Surface } from "@/core/primitives";

const formSchema = z.object({
  fullName:  z.string().min(2, "Name must be at least 2 characters"),
  phone:     z.string().min(10, "Enter a valid phone number"),
  email:     z.string().email("Enter a valid email address"),
  subject:   z.string().min(1, "Please select a subject"),
  message:   z.string().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const SUBJECTS = [
  "General Enquiry",
  "Technical Support",
  "Feature Request",
  "Partnership",
  "Press & Media",
  "Other",
];

const CONTACT_INFO = [
  {
    icon: MailIcon,
    label: "Email",
    value: "support@arogyavault.app",
    sub: "We reply within 24 hours",
  },
  {
    icon: PhoneIcon,
    label: "Phone",
    value: "+91 98765 43210",
    sub: "Mon–Fri, 9am–6pm IST",
  },
  {
    icon: MapPinIcon,
    label: "Office",
    value: "Hyderabad, Telangana",
    sub: "India",
  },
];

export const ContactFormSection = () => {
  const [submitted, setSubmitted] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    // Static site — simulate submission
    console.log("Contact form values:", values);
    setSubmitted(true);
  };

  return (
    <Section>
      <Container>
        <Grid cols={2} gap="lg">
          {/* Contact info panel */}
          <Stack gap="lg">
            <Stack gap="sm">
              <H3>Get in touch</H3>
              <Text className="text-muted-foreground leading-relaxed">
                Have a question, feedback, or want to partner with us? Fill in the
                form and our team will get back to you within one business day.
              </Text>
            </Stack>
            <Stack gap="md">
              {CONTACT_INFO.map(({ icon: Icon, label, value, sub }) => (
                <Row key={label} gap="md" align="start">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <Stack gap="xs">
                    <Text className="text-sm font-semibold">{label}</Text>
                    <Text className="text-sm text-foreground">{value}</Text>
                    <Muted className="text-xs">{sub}</Muted>
                  </Stack>
                </Row>
              ))}
            </Stack>
          </Stack>

          {/* Form */}
          <Surface variant="bordered" padding="lg">
            {submitted ? (
              <Stack gap="md" align="center" className="py-8 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircleIcon className="size-8 text-green-600" />
                </div>
                <H4>Message sent!</H4>
                <Text className="text-muted-foreground text-sm">
                  Thank you for reaching out. We&apos;ll reply to your email within 24 hours.
                </Text>
                <Button variant="outline" onClick={() => { setSubmitted(false); form.reset(); }}>
                  Send another message
                </Button>
              </Stack>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <Grid cols={2} gap="sm">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Priya Sharma" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+91 98765 43210" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Grid>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="priya@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SUBJECTS.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us how we can help..."
                            className="min-h-[120px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="gap-2 w-full" size="lg">
                    <SendIcon className="size-4" />
                    Send Message
                  </Button>
                </form>
              </Form>
            )}
          </Surface>
        </Grid>
      </Container>
    </Section>
  );
};
